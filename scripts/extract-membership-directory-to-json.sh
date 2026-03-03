#!/usr/bin/env bash
# LCR Login Script using playwright-cli
# Requires: LCR_USERNAME and LCR_PASS environment variables
# Usage: LCR_USERNAME=you@example.com LCR_PASS=secret ./lcr_login.sh

set -euo pipefail

# Helper: run snapshot, parse the .yml file path from output, and return file contents
take_snapshot() {
  local output
  output=$(playwright-cli snapshot)
  echo "$output" >&2 # print summary to stderr so it's visible but doesn't pollute stdout
  local snap_file
  snap_file=$(echo "$output" | grep -oE '\.playwright-cli/[^ )]+\.yml' | head -1)
  if [[ -z "$snap_file" ]]; then
    echo "ERROR: Could not find snapshot .yml file in playwright-cli output." >&2
    echo "Output was:" >&2
    echo "$output" >&2
    exit 1
  fi
  cat "$snap_file"
}

# Helper: extract the first element ref (e.g. e12) matching a keyword pattern from snapshot contents
get_ref() {
  local pattern="$1"
  local snapshot="$2"
  echo "$snapshot" | grep -iE "$pattern" | grep -oE '\be[0-9]+\b' | head -1
}

# ── Step 1: Open LCR ─────────────────────────────────────────────────────────
echo "==> Opening https://lcr.churchofjesuschrist.org (headed)..."
playwright-cli open https://lcr.churchofjesuschrist.org --headed
sleep 2

# ── Step 2: Snapshot the login page ──────────────────────────────────────────
echo "==> Snapshotting login page..."
SNAP1=$(take_snapshot)

# ── Step 3: Fill username ─────────────────────────────────────────────────────
USERNAME_REF=$(echo "$SNAP1" | grep -iE '.*textbox.*username' | grep -oE '\be[0-9]+\b' | head -1)
if [[ -z "$USERNAME_REF" ]]; then
  echo "ERROR: Could not find username field ref. Snapshot contents:" >&2
  echo "$SNAP1" >&2
  exit 1
fi
echo "==> Filling username (ref: $USERNAME_REF)..."
playwright-cli fill "$USERNAME_REF" "$LCR_USERNAME"

# ── Step 4: Click "Next" ─────────────────────────────────────────────────────
NEXT_REF=$(get_ref "next|continue" "$SNAP1")
if [[ -z "$NEXT_REF" ]]; then
  echo "ERROR: Could not find 'Next' button ref. Snapshot contents:" >&2
  echo "$SNAP1" >&2
  exit 1
fi
echo "==> Clicking 'Next' (ref: $NEXT_REF)..."
playwright-cli click "$NEXT_REF"
sleep 2

# ── Step 5: Snapshot the password page ───────────────────────────────────────
echo "==> Snapshotting password page..."
SNAP2=$(take_snapshot)

# ── Step 6: Fill password ─────────────────────────────────────────────────────
PASS_REF=$(get_ref ".*textbox.*password" "$SNAP2")
if [[ -z "$PASS_REF" ]]; then
  echo "ERROR: Could not find password field ref. Snapshot contents:" >&2
  echo "$SNAP2" >&2
  exit 1
fi
echo "==> Filling password (ref: $PASS_REF)..."
playwright-cli fill "$PASS_REF" "$LCR_PASS"

# ── Step 7: Click "Verify" ───────────────────────────────────────────────────
VERIFY_REF=$(get_ref "verify|sign.?in|log.?in" "$SNAP2")
if [[ -z "$VERIFY_REF" ]]; then
  echo "ERROR: Could not find 'Verify' button ref. Snapshot contents:" >&2
  echo "$SNAP2" >&2
  exit 1
fi
echo "==> Clicking 'Verify' (ref: $VERIFY_REF)..."
playwright-cli click "$VERIFY_REF"
sleep 3

# ── Step 8: Snapshot the post-login dashboard ────────────────────────────────
echo "==> Navigating to member directory"
playwright-cli goto https://lcr.churchofjesuschrist.org/records/member-list?lang=eng
sleep 3

echo "==> Scrolling to bottom of page to load all members..."
playwright-cli eval "window.scrollTo(0, document.body.scrollHeight)"
sleep 1
playwright-cli eval "window.scrollTo(0, document.body.scrollHeight)"
sleep 1
playwright-cli eval "window.scrollTo(0, document.body.scrollHeight)"
sleep 1

# ── Step 9: Snapshot the member directory ────────────────────────────────
echo "==> Snapshotting member directory page..."
SNAP3=$(take_snapshot)

# ── Step 11: Extract member data and write to JSON ───────────────────────────
echo ""
echo "==> Extracting member data..."

OUTPUT_FILE="members.json"
echo "[" >"$OUTPUT_FILE"
first_entry=true

echo "$SNAP3" | grep -E 'row "' | while IFS= read -r line; do
  # Extract the quoted row content
  content=$(echo "$line" | sed -E 's/^[^"]*"(.+)"[[:space:]]*(\[.*)?$/\1/')

  # Skip if it doesn't look like a data row (must contain a date like "22 Dec 1982")
  echo "$content" | grep -qE '[0-9]{1,2} [A-Za-z]{3} [0-9]{4}' || continue

  # Name: everything before the gender token (single M or F surrounded by spaces)
  name=$(echo "$content" | sed -E 's/ [MF] .*//')

  # Gender: single letter M or F as a standalone token
  gender=$(echo "$content" | grep -oE ' [MF] ' | head -1 | tr -d ' ')

  # Age: the number immediately after the gender letter
  age=$(echo "$content" | sed -E 's/^.* [MF] ([0-9]{1,3}) .*/\1/')

  # Phone: match any common US format and normalize to (xxx)xxx-xxxx
  # Handles: +1xxxxxxxxxx, 1-xxx-xxx-xxxx, xxx-xxx-xxxx, xxxxxxxxxx, (xxx)xxx-xxxx, (xxx) xxx-xxxx, xxx xxx xxxx
  raw_phone=$(echo "$content" | grep -oE '(\+?1[-. ]?)?(\([0-9]{3}\)[-. ]?|[0-9]{3}[-. ])[0-9]{3}[-. ][0-9]{4}|(\+?1)?[0-9]{10}' | head -1 || true)
  if [[ -n "$raw_phone" ]]; then
    digits=$(echo "$raw_phone" | tr -cd '0-9')
    [[ ${#digits} -eq 11 && "${digits:0:1}" == "1" ]] && digits="${digits:1}"
    phone="(${digits:0:3})${digits:3:3}-${digits:6:4}"
  else
    phone=""
  fi

  # Escape double quotes in name for valid JSON
  name_escaped=$(echo "$name" | sed 's/"/\\"/g')

  # Write comma before each entry except the first
  if [[ "$first_entry" == "true" ]]; then
    first_entry=false
  else
    echo "," >>"$OUTPUT_FILE"
  fi

  printf '  {"name": "%s", "gender": "%s", "age": %s, "phone": "%s"}' \
    "$name_escaped" "$gender" "$age" "$phone" >>"$OUTPUT_FILE"
done

echo "" >>"$OUTPUT_FILE"
echo "]" >>"$OUTPUT_FILE"

echo ""
echo "✅ Done! Successfully navigated to the Membership section."

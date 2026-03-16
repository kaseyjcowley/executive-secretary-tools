import { describe, it, expect } from "vitest";

const PUBLIC_PATHS = [
  "/api/auth/",
  "/api/crons/",
  "/api/cron/",
  "/api/slack/",
  "/api/post-prayers-to-slack",
  "/api/post-interviews-to-slack",
  "/api/interviews",
];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

describe("middleware", () => {
  describe("PUBLIC_PATHS", () => {
    it("allows /api/auth/ routes", () => {
      expect(isPublicPath("/api/auth/signin")).toBe(true);
      expect(isPublicPath("/api/auth/signout")).toBe(true);
      expect(isPublicPath("/api/auth/callback/google")).toBe(true);
    });

    it("allows /api/crons/ routes", () => {
      expect(isPublicPath("/api/crons/some-cron")).toBe(true);
    });

    it("allows /api/cron/ routes", () => {
      expect(isPublicPath("/api/cron/some-cron")).toBe(true);
    });

    it("allows /api/slack/ routes", () => {
      expect(isPublicPath("/api/slack/events")).toBe(true);
      expect(isPublicPath("/api/slack/interactive")).toBe(true);
    });

    it("allows /api/post-prayers-to-slack (with and without trailing slash)", () => {
      expect(isPublicPath("/api/post-prayers-to-slack")).toBe(true);
      expect(isPublicPath("/api/post-prayers-to-slack/")).toBe(true);
    });

    it("allows /api/post-interviews-to-slack (with and without trailing slash)", () => {
      expect(isPublicPath("/api/post-interviews-to-slack")).toBe(true);
      expect(isPublicPath("/api/post-interviews-to-slack/")).toBe(true);
    });

    it("allows /api/interviews", () => {
      expect(isPublicPath("/api/interviews")).toBe(true);
    });

    it("does not allow arbitrary /api routes", () => {
      expect(isPublicPath("/api/some-other-route")).toBe(false);
      expect(isPublicPath("/api/members")).toBe(false);
    });

    it("does not allow /internal routes", () => {
      expect(isPublicPath("/internal/some-endpoint")).toBe(false);
    });

    it("does not allow /auth routes (without api prefix)", () => {
      expect(isPublicPath("/auth/signin")).toBe(false);
    });

    it("does not allow root / route", () => {
      expect(isPublicPath("/")).toBe(false);
    });
  });
});

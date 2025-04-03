import redis from "@/utils/redis"; // Import redis client
import { sendEmail } from "./email";
import { getClosestSunday } from "./dates";
import format from "date-fns/format";
import {
  nextWednesday,
  setHours,
  setMinutes,
  setSeconds,
  differenceInSeconds,
} from "date-fns";

export const app = new App({
  token: process.env.SLACK_USER_OAUTH_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

type ActionId = "sacrament-speakers";

interface SlackInteractivityPayload {
  actions: [
    {
  type: string;
  block_id: string;
  action_id: ActionId;
  value: string;
  action_ts: string;
    },
  ];
  trigger_id: string;
}

interface SlackInteractivityHandler {
  handle(payload: SlackInteractivityPayload, dryRun: boolean): Promise<void>;
}

export class HandlerFactory {
  static create(actionId: ActionId): SlackInteractivityHandler {
    switch (actionId) {
      case "sacrament-speakers":
        return new SacramentSpeakersHandler();
    }
  }
}

function calculateNextWednesdayExpiry(currentDate: Date): Date {
  let expiryDate = nextWednesday(currentDate);
  expiryDate = setHours(expiryDate, 15); // 3 PM
  expiryDate = setMinutes(expiryDate, 0);
  expiryDate = setSeconds(expiryDate, 0);
  return expiryDate;
}

class SacramentSpeakersHandler implements SlackInteractivityHandler {
  async handle(
    { actions: [action] }: SlackInteractivityPayload,
    dryRun: boolean
  ): Promise<void> {
    const closestSunday = getClosestSunday();
    const dateKey = format(closestSunday, "yyyy-MM-dd"); // Use consistent date format for key
    const redisKey = `sacrament-speakers:${dateKey}`;

    try {
      const emailSentTimestamp = await redis.get(redisKey); // Get potential timestamp

      if (emailSentTimestamp) {
        console.log(
          `Email for sacrament speakers on ${dateKey} already sent at ${emailSentTimestamp}. Skipping.`
        );
        return;
      }

      console.log("Beginning send email...");
      const formattedDate = format(closestSunday, "MMMM do"); // For email content
      const recipient = dryRun
        ? process.env.EMAIL_SENDER
        : process.env.EMAIL_RECIPIENT;
      console.log(`Sending email to ${recipient} with date: ${formattedDate}`);

      await sendEmail({
        subject: `28th Ward Sacrament Speakers for ${formattedDate}`,
        text: `Hi Brother Cain, here are our speakers for ${formattedDate}:\n\n${action.value}\n\nThanks!\nKasey Cowley`,
        to: recipient,
        from: process.env.EMAIL_SENDER,
      });

      const now = new Date(); // Capture timestamp *after* email is sent
      const expiryDate = calculateNextWednesdayExpiry(now);
      const expirySeconds = differenceInSeconds(expiryDate, now);
      const sentTimestamp = now.toISOString(); // Use the captured timestamp

      // Ensure expiry is positive (at least 1 second)
      if (expirySeconds > 0) {
        await redis.setex(redisKey, expirySeconds, sentTimestamp); // Store timestamp
        console.log(
          `Done sending! Set Redis key ${redisKey} with value ${sentTimestamp} to expire in ${expirySeconds} seconds (at ${expiryDate.toISOString()})`
        );
      } else {
        console.warn(
          `Calculated expiry time (${expiryDate.toISOString()}) is in the past. Not setting Redis key ${redisKey}.`
        );
      }
    } catch (err) {
      console.error("Error during SacramentSpeakersHandler execution:", err);
      // Consider if you need error handling if Redis fails but email succeeds
    }
  }
}
      return;
    }
  }
}

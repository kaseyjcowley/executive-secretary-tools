import { App } from "@slack/bolt";
import { sendEmail } from "./email";
import { getClosestSunday } from "./dates";
import format from "date-fns/format";

export const app = new App({
  token: process.env.SLACK_USER_OAUTH_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

type ActionId = "sacrament-speakers";

interface SlackInteractivityAction {
  type: string;
  block_id: string;
  action_id: ActionId;
  value: string;
  action_ts: string;
}

interface SlackInteractivityHandler {
  handle(action: SlackInteractivityAction, dryRun: boolean): Promise<void>;
}

export class HandlerFactory {
  static create(actionId: ActionId): SlackInteractivityHandler {
    switch (actionId) {
      case "sacrament-speakers":
        return new SacramentSpeakersHandler();
    }
  }
}

class SacramentSpeakersHandler implements SlackInteractivityHandler {
  async handle(
    action: SlackInteractivityAction,
    dryRun: boolean
  ): Promise<void> {
    try {
      const date = format(getClosestSunday(), "MMMM do");
      sendEmail({
        subject: `28th Ward Sacrament Speakers for ${date}`,
        text: `Hi Brother Cain, here are our speakers for ${date}:\n\n${action.value}\n\nThanks!\nKasey Cowley`,
        to: dryRun ? process.env.EMAIL_SENDER : process.env.EMAIL_RECIPIENT,
        from: process.env.EMAIL_SENDER,
      });
    } catch (err) {
      console.error(err);
      return;
    }
  }
}

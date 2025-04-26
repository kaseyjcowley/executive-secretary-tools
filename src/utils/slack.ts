import { SlackChannelId, BishopricSlackMemberIds } from "@/constants";
import redis from "@/utils/redis";
import { App } from "@slack/bolt";
import {
  differenceInSeconds,
  nextWednesday,
  setHours,
  setMinutes,
  setSeconds,
} from "date-fns";
import format from "date-fns/format";
import * as R from "rambdax";
import { BlockKit, InputBlockBuilder } from "./block-kit-builder";
import { getClosestSunday } from "./dates";
import { sendEmail } from "./email";

export const app = new App({
  token: process.env.SLACK_USER_OAUTH_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

type HandlerIdentifier =
  | "submit_speakers"
  | "open_speakers_modal"
  | "add_speaker_input";

type ActionValue = {
  type: string;
  value: string;
};

type BlockActions = {
  [action: string]: ActionValue;
};

type StateValues = {
  [block: string]: BlockActions;
};

// The full view type given in the prompt
type ViewState = {
  id: string;
  state: {
    values: StateValues;
  };
  private_metadata: string;
};

interface SlackInteractivityPayload {
  actions: [
    {
      type: string;
      block_id: string;
      action_id: HandlerIdentifier;
      value: string;
      action_ts: string;
    },
  ];
  trigger_id: string;
  view: ViewState;
  container: {
    message_ts: string;
  };
}

type HandlerResponse = Record<string, any>;

interface SlackInteractivityHandler {
  handle(
    payload: SlackInteractivityPayload,
    dryRun: boolean
  ): Promise<HandlerResponse | void>;
}

export class HandlerFactory {
  static create(
    handlerIdentifier: HandlerIdentifier
  ): SlackInteractivityHandler {
    switch (handlerIdentifier) {
      case "submit_speakers":
        return new SacramentSpeakersHandler();
      case "open_speakers_modal":
      case "add_speaker_input":
        return new OpenSpeakersModalHandler();
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
    payload: SlackInteractivityPayload,
    dryRun: boolean
  ): Promise<HandlerResponse | void> {
    const extractValuesFromView = R.pipe<
      ViewState[],
      StateValues | undefined,
      StateValues | {},
      BlockActions[],
      ActionValue[],
      string[]
    >(
      // Safely get state.values (might be undefined)
      R.path(["state", "values"]),
      // If path was nil, provide {} to prevent errors downstream
      R.defaultTo({}),
      // Get values of the blocks -> BlockActions[]
      R.values,
      // Map R.values over each BlockActions and flatten -> ActionValue[]
      R.chain(R.values),
      // Extract the 'value' property -> string[]
      R.pluck("value")
    );

    const speakers = extractValuesFromView(payload.view);

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
        text: `Hi Brother Cain, here are our speakers for ${formattedDate}:\n\n${speakers.join("\n")}\n\nThanks!\nKasey Cowley`,
        to: recipient,
        from: process.env.EMAIL_SENDER,
      });

      let metadata;
      try {
        metadata = JSON.parse(payload.view.private_metadata);
      } catch (e) {
        metadata = {};
      }

      await app.client.chat.postMessage({
        channel: dryRun
          ? SlackChannelId.automationTesting
          : SlackChannelId.bishopric,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "*Automated reply:*\n\nSacrament speakers have been submitted. Thanks!",
            },
          },
        ],
        thread_ts: metadata.conversation_ts,
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

      return { response_action: "clear" };
    } catch (err) {
      console.error("Error during SacramentSpeakersHandler execution:", err);
      // Consider if you need error handling if Redis fails but email succeeds
    }
  }
}

class OpenSpeakersModalHandler implements SlackInteractivityHandler {
  private INITIAL_INPUT_NUMBER = 2;

  async handle(
    payload: SlackInteractivityPayload,
    dryRun: boolean
  ): Promise<void> {
    const metadata = JSON.stringify({
      dryRun,
      conversation_ts: payload.container.message_ts,
    });

    const extractValuesFromView = R.pipe<
      ViewState[],
      StateValues | undefined,
      StateValues | {},
      BlockActions[],
      ActionValue[],
      string[]
    >(
      // Safely get state.values (might be undefined)
      R.path(["state", "values"]),
      // If path was nil, provide {} to prevent errors downstream
      R.defaultTo({}),
      // Get values of the blocks -> BlockActions[]
      R.values,
      // Map R.values over each BlockActions and flatten -> ActionValue[]
      R.chain(R.values),
      // Extract the 'value' property -> string[]
      R.pluck("value")
    );

    const previousValues = extractValuesFromView(payload.view);
    const inputBlockBuilders = this.initialSpeakerBlockBuilders(previousValues);

    // Build the modal view using the fluent interface
    const modalViewBuilder = BlockKit.modal(
      BlockKit.plainText("Sacrament Speakers")
    )
      .callbackId("submit_speakers")
      .privateMetadata(metadata) // Pass dryRun status
      .submit(BlockKit.plainText("Submit"))
      .close(BlockKit.plainText("Cancel"))
      .addBlock(
        BlockKit.section().text(
          BlockKit.plainText(
            "Please add the Sacrament speakers for this week below.",
            { emoji: true }
          )
        )
      )
      .addBlocks(inputBlockBuilders) // Add the input blocks from builders
      .addBlock(
        BlockKit.actions()
          .blockId("add_speaker_button_block")
          .addElement(
            BlockKit.button(
              BlockKit.plainText("Add another speaker", { emoji: true })
            )
              .style("primary")
              .actionId("add_speaker_input")
          )
      );

    const finalModalView = modalViewBuilder.build();

    if (payload.actions[0].action_id === "add_speaker_input") {
      await app.client.views.update({
        view_id: payload.view.id,
        view: finalModalView, // Use the built view
      });
      return;
    }

    await app.client.views.open({
      trigger_id: payload.trigger_id,
      view: finalModalView, // Use the built view
    });
  }

  // Renamed and updated to return builders
  initialSpeakerBlockBuilders(previousValues: string[]): InputBlockBuilder[] {
    const builders: InputBlockBuilder[] = [];
    const numberOfInputs =
      previousValues.length > 0
        ? previousValues.length + 1
        : this.INITIAL_INPUT_NUMBER;

    for (let i = 0; i < numberOfInputs; i++) {
      const inputBuilder = BlockKit.input(
        BlockKit.plainText(`Speaker ${i + 1}`)
      )
        .blockId(`speaker_input_block_${i}`)
        .element(
          BlockKit.plainTextInput()
            .actionId(`speaker_input_action_${i}`)
            .maybeInitialValue(previousValues?.[i]) // Use maybeInitialValue
        );
      builders.push(inputBuilder);
    }

    return builders;
  }
}

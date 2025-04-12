import { App } from "@slack/bolt";
import redis from "@/utils/redis";
import { sendEmail } from "./email";
import { BlockKit, InputBlockBuilder } from "./block-kit-builder";
import { getClosestSunday } from "./dates";
import format from "date-fns/format";
import * as R from "rambdax";
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

type ActionId =
  | "sacrament-speakers"
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
};

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
  view: ViewState;
}

interface SlackInteractivityHandler {
  handle(payload: SlackInteractivityPayload, dryRun: boolean): Promise<void>;
}

export class HandlerFactory {
  static create(actionId: ActionId): SlackInteractivityHandler {
    switch (actionId) {
      case "sacrament-speakers":
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

class OpenSpeakersModalHandler implements SlackInteractivityHandler {
  private INITIAL_INPUT_NUMBER = 2;

  async handle(
    payload: SlackInteractivityPayload,
    dryRun: boolean
  ): Promise<void> {
    const metadata = JSON.stringify({ dryRun });

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
      .callbackId("submit_speakers_modal")
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

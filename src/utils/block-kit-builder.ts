import {
  View,
  ModalView,
  HomeView,
  Block,
  KnownBlock,
  PlainTextElement,
  MrkdwnElement,
  Button,
  SectionBlock,
  DividerBlock,
  ActionsBlock,
  InputBlock,
  PlainTextInput,
} from "@slack/bolt";

// --- Text Object Builders ---
type TextObjectOutput = PlainTextElement | MrkdwnElement;

abstract class TextBuilder {
  protected _text: string;
  protected _emoji?: boolean;

  constructor(text: string) {
    this._text = text;
  }

  emoji(useEmoji: boolean = true): this {
    this._emoji = useEmoji;
    return this;
  }

  abstract build(): TextObjectOutput;
}

class PlainTextBuilder extends TextBuilder {
  build(): PlainTextElement {
    return {
      type: "plain_text",
      text: this._text,
      ...(this._emoji !== undefined && { emoji: this._emoji }),
    };
  }
}

class MarkdownTextBuilder extends TextBuilder {
  build(): MrkdwnElement {
    return {
      type: "mrkdwn",
      text: this._text,
    };
  }
}

// --- Element Builders ---

abstract class ElementBuilder {
  protected _actionId?: string;

  actionId(id: string): this {
    this._actionId = id;
    return this;
  }

  abstract build(): any;
}

class ButtonElementBuilder extends ElementBuilder {
  private _text: PlainTextElement;
  private _style?: "primary" | "danger";
  private _value?: string;
  private _url?: string;

  constructor(textBuilder: PlainTextBuilder) {
    super();
    this._text = textBuilder.build();
  }

  style(style: "primary" | "danger"): this {
    this._style = style;
    return this;
  }

  value(val: string): this {
    this._value = val;
    return this;
  }

  url(url: string): this {
    this._url = url;
    return this;
  }

  build(): Button {
    if (!this._actionId) {
      throw new Error("Button element requires an actionId");
    }
    return {
      type: "button",
      text: this._text,
      action_id: this._actionId,
      ...(this._style && { style: this._style }),
      ...(this._value && { value: this._value }),
      ...(this._url && { url: this._url }),
    };
  }
}

class PlainTextInputElementBuilder extends ElementBuilder {
  private _initialValue?: string;
  private _multiline?: boolean;
  private _minLength?: number;
  private _maxLength?: number;
  private _placeholder?: PlainTextElement; // Corrected type

  initialValue(value: string): this {
    this._initialValue = value;
    return this;
  }

  maybeInitialValue(value?: string | null): this {
    if (value !== undefined && value !== null) {
      this._initialValue = value;
    }
    return this;
  }

  multiline(isMultiline: boolean = true): this {
    this._multiline = isMultiline;
    return this;
  }

  minLength(length: number): this {
    this._minLength = length;
    return this;
  }

  maxLength(length: number): this {
    this._maxLength = length;
    return this;
  }

  placeholder(textBuilder: PlainTextBuilder): this {
    this._placeholder = textBuilder.build();
    return this;
  }

  build(): PlainTextInput {
    if (!this._actionId) {
      throw new Error("PlainTextInput element requires an actionId");
    }
    return {
      type: "plain_text_input",
      action_id: this._actionId,
      ...(this._initialValue !== undefined && {
        initial_value: this._initialValue,
      }),
      ...(this._multiline !== undefined && { multiline: this._multiline }),
      ...(this._minLength !== undefined && { min_length: this._minLength }),
      ...(this._maxLength !== undefined && { max_length: this._maxLength }),
      ...(this._placeholder && { placeholder: this._placeholder }),
    };
  }
}

// --- Block Builders ---

abstract class BlockBuilder {
  protected _blockId?: string;

  blockId(id: string): this {
    this._blockId = id;
    return this;
  }

  abstract build(): KnownBlock | Block;
}

class SectionBlockBuilder extends BlockBuilder {
  private _text?: TextObjectOutput;
  private _fields?: TextObjectOutput[];
  private _accessory?: any;

  text(textBuilder: TextBuilder): this {
    this._text = textBuilder.build();
    return this;
  }

  build(): SectionBlock {
    if (!this._text && !this._fields) {
      throw new Error("Section block requires either text or fields");
    }
    return {
      type: "section",
      ...(this._blockId && { block_id: this._blockId }),
      ...(this._text && { text: this._text }),
      ...(this._fields && { fields: this._fields }),
      ...(this._accessory && { accessory: this._accessory }),
    };
  }
}

class DividerBlockBuilder extends BlockBuilder {
  build(): DividerBlock {
    return {
      type: "divider",
      ...(this._blockId && { block_id: this._blockId }),
    };
  }
}

class ActionsBlockBuilder extends BlockBuilder {
  private _elements: any[] = [];

  addElement(elementBuilder: ElementBuilder): this {
    this._elements.push(elementBuilder.build());
    return this;
  }

  build(): ActionsBlock {
    if (this._elements.length === 0) {
      throw new Error("Actions block requires at least one element");
    }
    if (!this._blockId) {
      // While not strictly required by Slack, it's highly recommended for state tracking
      console.warn("Actions block is missing a blockId, which is recommended.");
    }
    return {
      type: "actions",
      elements: this._elements,
      ...(this._blockId && { block_id: this._blockId }),
    };
  }
}

export class InputBlockBuilder extends BlockBuilder {
  private _label: PlainTextElement;
  private _element: any;
  private _hint?: PlainTextElement;
  private _optional?: boolean;
  private _dispatchAction?: boolean;

  constructor(labelBuilder: PlainTextBuilder) {
    super();
    this._label = labelBuilder.build();
  }

  element(elementBuilder: ElementBuilder): this {
    // Currently only supports PlainTextInput, extend as needed
    if (!(elementBuilder instanceof PlainTextInputElementBuilder)) {
      throw new Error(
        "Input block currently only supports PlainTextInputElementBuilder"
      );
    }
    this._element = elementBuilder.build();
    return this;
  }

  hint(hintBuilder: PlainTextBuilder): this {
    this._hint = hintBuilder.build();
    return this;
  }

  optional(isOptional: boolean = true): this {
    this._optional = isOptional;
    return this;
  }

  dispatchAction(dispatch: boolean = true): this {
    this._dispatchAction = dispatch;
    return this;
  }

  build(): InputBlock {
    if (!this._element) {
      throw new Error("Input block requires an element");
    }
    if (!this._blockId) {
      // While not strictly required by Slack, it's highly recommended for state tracking
      console.warn("Input block is missing a blockId, which is recommended.");
    }
    return {
      type: "input",
      label: this._label,
      element: this._element,
      ...(this._blockId && { block_id: this._blockId }),
      ...(this._hint && { hint: this._hint }),
      ...(this._optional !== undefined && { optional: this._optional }),
      ...(this._dispatchAction !== undefined && {
        dispatch_action: this._dispatchAction,
      }),
    };
  }
}

// --- View Builders ---

abstract class ViewBuilder {
  protected _blocks: (KnownBlock | Block)[] = [];
  protected _privateMetadata?: string;
  protected _callbackId?: string;
  protected _externalId?: string;

  addBlock(blockBuilder: BlockBuilder): this {
    this._blocks.push(blockBuilder.build());
    return this;
  }

  addBlocks(blockBuilders: BlockBuilder[]): this {
    blockBuilders.forEach((builder) => this.addBlock(builder));
    return this;
  }

  privateMetadata(metadata: string): this {
    this._privateMetadata = metadata;
    return this;
  }

  callbackId(id: string): this {
    this._callbackId = id;
    return this;
  }

  externalId(id: string): this {
    this._externalId = id;
    return this;
  }

  abstract build(): View;
}

class ModalViewBuilder extends ViewBuilder {
  private _title: PlainTextElement;
  private _submit?: PlainTextElement;
  private _close?: PlainTextElement;
  private _clearOnClose?: boolean;
  private _notifyOnClose?: boolean;

  constructor(titleBuilder: PlainTextBuilder) {
    super();
    this._title = titleBuilder.build();
  }

  submit(submitBuilder: PlainTextBuilder): this {
    this._submit = submitBuilder.build();
    return this;
  }

  close(closeBuilder: PlainTextBuilder): this {
    this._close = closeBuilder.build();
    return this;
  }

  clearOnClose(clear: boolean = true): this {
    this._clearOnClose = clear;
    return this;
  }

  notifyOnClose(notify: boolean = true): this {
    this._notifyOnClose = notify;
    return this;
  }

  build(): ModalView {
    if (this._blocks.length === 0) {
      throw new Error("Modal view requires at least one block");
    }
    return {
      type: "modal",
      title: this._title,
      blocks: this._blocks,
      ...(this._submit && { submit: this._submit }),
      ...(this._close && { close: this._close }),
      ...(this._privateMetadata && { private_metadata: this._privateMetadata }),
      ...(this._callbackId && { callback_id: this._callbackId }),
      ...(this._externalId && { external_id: this._externalId }),
      ...(this._clearOnClose !== undefined && {
        clear_on_close: this._clearOnClose,
      }),
      ...(this._notifyOnClose !== undefined && {
        notify_on_close: this._notifyOnClose,
      }),
    };
  }
}

class HomeTabViewBuilder extends ViewBuilder {
  build(): HomeView {
    if (this._blocks.length === 0) {
      throw new Error("Home tab view requires at least one block");
    }
    return {
      type: "home",
      blocks: this._blocks,
      ...(this._privateMetadata && { private_metadata: this._privateMetadata }),
      ...(this._callbackId && { callback_id: this._callbackId }),
      ...(this._externalId && { external_id: this._externalId }),
    };
  }
}

// --- Message Payload Builder ---
// Not a standard Block Kit concept, but useful for chat.postMessage etc.

class MessagePayloadBuilder {
  private _channel?: string;
  private _text?: string;
  private _blocks: (KnownBlock | Block)[] = [];
  private _threadTs?: string;
  private _mrkdwn?: boolean = true;

  channel(channelId: string): this {
    this._channel = channelId;
    return this;
  }

  text(fallbackText: string): this {
    this._text = fallbackText;
    return this;
  }

  addBlock(blockBuilder: BlockBuilder): this {
    this._blocks.push(blockBuilder.build());
    return this;
  }

  addBlocks(blockBuilders: BlockBuilder[]): this {
    blockBuilders.forEach((builder) => this.addBlock(builder));
    return this;
  }

  threadTs(ts: string): this {
    this._threadTs = ts;
    return this;
  }

  mrkdwn(useMrkdwn: boolean): this {
    this._mrkdwn = useMrkdwn;
    return this;
  }

  build(): {
    channel?: string;
    text?: string;
    blocks: (KnownBlock | Block)[];
    thread_ts?: string;
    mrkdwn?: boolean;
  } & { channel: string } {
    // Ensure channel is always string in return type
    if (!this._channel) {
      // This runtime check ensures _channel is defined, but TS needs explicit typing
      throw new Error("MessagePayload requires a channel");
    }
    if (this._blocks.length === 0 && !this._text) {
      throw new Error("MessagePayload requires blocks or fallback text");
    }
    return {
      channel: this._channel,
      blocks: this._blocks,
      ...(this._text && { text: this._text }),
      ...(this._threadTs && { thread_ts: this._threadTs }),
      ...(this._mrkdwn !== undefined && { mrkdwn: this._mrkdwn }),
    };
  }
}

// --- Main Factory ---

export class BlockKit {
  // Text Objects
  static plainText(
    text: string,
    options?: { emoji?: boolean }
  ): PlainTextBuilder {
    const builder = new PlainTextBuilder(text);
    if (options?.emoji !== undefined) builder.emoji(options.emoji);
    return builder;
  }

  static markdownText(text: string): MarkdownTextBuilder {
    return new MarkdownTextBuilder(text);
  }

  // Elements
  static button(textBuilder: PlainTextBuilder): ButtonElementBuilder {
    return new ButtonElementBuilder(textBuilder);
  }

  static plainTextInput(): PlainTextInputElementBuilder {
    return new PlainTextInputElementBuilder();
  }

  // Blocks
  static section(): SectionBlockBuilder {
    return new SectionBlockBuilder();
  }

  static divider(): DividerBlockBuilder {
    return new DividerBlockBuilder();
  }

  static actions(): ActionsBlockBuilder {
    return new ActionsBlockBuilder();
  }

  static input(labelBuilder: PlainTextBuilder): InputBlockBuilder {
    return new InputBlockBuilder(labelBuilder);
  }

  // Views
  static modal(titleBuilder: PlainTextBuilder): ModalViewBuilder {
    return new ModalViewBuilder(titleBuilder);
  }

  static homeTab(): HomeTabViewBuilder {
    return new HomeTabViewBuilder();
  }

  // Message Payload
  static message(): MessagePayloadBuilder {
    return new MessagePayloadBuilder();
  }
}

export type AppState = { inputText: InputTextState } | { read: ReadState };

export type InputTextState = true;

export type ReadState = {
  sentences: string[];
  current: number;
  playState: PlayState;
};

export type PlayState =
  | { pausedAt: number }
  | { playing: { from: number; to: number } };

export const defaultState: AppState = {
  inputText: true,
};

export type Action = { inputText: string };

export function update(state: AppState, action: Action): AppState {
  if ("inputText" in action) {
    const sents = Array.from(sentences(action.inputText));
    if (sents.length === 0) throw new Error(`TODO render error`);

    return {
      read: {
        sentences: sents,
        current: 0,
        playState: { pausedAt: 0 },
      },
    };
  }

  throw new Error(`Unexpected action`);
}

const sentenceTerminator = /[。︀։।]|\n|\.(?:\s|$)/mu;

function* sentences(inputText: string) {
  while (inputText.length > 0) {
    const match = sentenceTerminator.exec(inputText);
    if (match) {
      const end = match.index + match[0].length;
      const line = inputText.substr(0, end).trim();
      inputText = inputText.substr(end);
      if (line.length > 0) yield line;
    } else {
      const line = inputText.trim();
      inputText = "";
      if (line.length > 0) yield line;
    }
  }
}

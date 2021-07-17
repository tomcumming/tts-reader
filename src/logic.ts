export type AppState = { inputText: InputTextState } | { read: ReadState };

export type InputTextState = true;

export type ReadState = {
  sentences: string[];
  current: number;
  playState: PlayState;
};

export type PlayState =
  | { pausedAt: number }
  | { playing: { position: number } };

export const defaultState: AppState = {
  inputText: true,
};

export type Action =
  | { inputText: string }
  | { playingPosition: number }
  | { finishedSpeech: { error: boolean } };

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
  } else if ("playingPosition" in action) {
    if ("read" in state) {
      return {
        read: {
          ...state.read,
          playState: { playing: { position: action.playingPosition } },
        },
      };
    } else {
      console.debug("Update playing pos while not on read screen");
      return state;
    }
  } else if ("finishedSpeech" in action) {
    if ("read" in state) {
      return {
        read: {
          ...state.read,
          playState: { pausedAt: 0 },
        },
      };
    } else {
      console.debug("Finished speech while not on read screen");
      return state;
    }
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

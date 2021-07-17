export type AppState = { inputText: InputTextState } | { read: ReadState };

export type InputTextState = true;

export type ReadState = {
  sentences: string[];
};

export const defaultState: AppState = {
  inputText: true,
};

export type Action = { inputText: string };

export function update(state: AppState, action: Action): AppState {
  if ("inputText" in action) {
    return {
      read: {
        sentences: Array.from(sentences(action.inputText)),
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

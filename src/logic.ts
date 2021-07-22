export type AppState = { settings: Settings } & ScreenState;

export type Settings = {
  voiceUri?: string;
  rate: number;
};

export type ScreenState =
  | { selectVoice: SelectVoiceState }
  | { inputText: InputTextState }
  | { read: ReadState };

export type InputTextState = true;

export type ReadState = {
  sentences: string[];
  current: number;
  playState: PlayState;
};

export type SelectVoiceState = {
  voices: SpeechSynthesisVoice[];
  backTo?: { sentences: string[]; current: number };
};

export type PlayState =
  | { pausedAt: number }
  | { playing: { position: number } };

export const defaultState: AppState = {
  inputText: true,
  settings: { rate: 1 },
};

export type Action =
  | { setSettings: Partial<Settings> }
  | { selectVoice: { voices: SpeechSynthesisVoice[] } }
  | { voiceConfirmed: Settings }
  | { inputText: { text: string; mode: "phrases" | "sentences" } }
  | { playingPosition: number }
  | { movePaused: { afterCursor: boolean; offset: number } }
  | { stoppedSpeech: "error" | "paused" | "finished" }
  | { changeSentence: number }
  | { selectText: true };

const sentenceTerminator = /[．。︀!ǃ！?？]|\n|\.(?:\s|$)/mu;
const phraseTerminator = new RegExp(
  sentenceTerminator.source + `|[，、，;；]|,(?:\\D|$)`,
  "mu"
);

export function* sentences(inputText: string, mode: "phrases" | "sentences") {
  while (inputText.length > 0) {
    const match =
      mode === "phrases"
        ? phraseTerminator.exec(inputText)
        : sentenceTerminator.exec(inputText);
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

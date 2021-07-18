import { defaultState, Action, update } from "./logic.js";
import { updateScreen } from "./render.js";

let selectedVoiceUri: undefined | string =
  localStorage.getItem("selectedVoiceUri") || undefined;
let currentUtterance: undefined | SpeechSynthesisUtterance;

let state = defaultState;

function fireAction(action: Action) {
  const lastState = state;
  state = update(state, action);
  updateScreen(lastState, state);
}

function startSpeaking(offset: number, text: string) {
  speechSynthesis.cancel();
  currentUtterance = new SpeechSynthesisUtterance(text);
  const selectedVoice = speechSynthesis
    .getVoices()
    .find((v) => v.voiceURI === selectedVoiceUri);
  if (selectedVoice) currentUtterance.voice = selectedVoice;
  currentUtterance.onstart = (_e) => fireAction({ playingPosition: offset });
  currentUtterance.onboundary = (e) =>
    fireAction({ playingPosition: offset + e.charIndex });
  currentUtterance.onend = (e) =>
    fireAction({ finishedSpeech: { error: false } });
  currentUtterance.onerror = (e) =>
    fireAction({ finishedSpeech: { error: true } });
  speechSynthesis.speak(currentUtterance);
}

function onClick(e: MouseEvent) {
  if (e.target instanceof HTMLElement) {
    if (e.target.matches("main.input-text-screen > button")) {
      const textArea = document.querySelector("textarea");
      if (textArea instanceof HTMLTextAreaElement)
        fireAction({ inputText: textArea.value });
      else throw new Error(`Could not find textarea`);
    }

    if (e.target.matches("main.reader-screen > .controls .play")) {
      if ("read" in state && "pausedAt" in state.read.playState) {
        const sentence = state.read.sentences[state.read.current];
        const speechStr = sentence.substr(state.read.playState.pausedAt);
        startSpeaking(state.read.playState.pausedAt, sentence);
      }
    }

    if (e.target.matches("main.reader-screen > .controls .voice")) {
      if ("read" in state) {
        fireAction({
          selectVoice: {
            voices: speechSynthesis.getVoices(),
          },
        });
      }
    }

    if (e.target.matches("main.select-voice-screen tr button")) {
      selectedVoiceUri =
        e.target.parentElement?.parentElement?.getAttribute("data-voice") ||
        undefined;
      if (selectedVoiceUri)
        localStorage.setItem("selectedVoiceUri", selectedVoiceUri);
      fireAction({ voiceConfirmed: { voiceUri: selectedVoiceUri } });
    }
  }
}

document.body.addEventListener("click", onClick);

speechSynthesis.getVoices();
updateScreen(undefined, state);

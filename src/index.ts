import { defaultState, Action } from "./logic.js";
import { update } from "./update.js";
import { updateScreen } from "./render.js";
import { selectionLength } from "./selection.js";

let currentUtterance: undefined | SpeechSynthesisUtterance;

let state = defaultState;
{
  const loadedSettings = localStorage.getItem("settings");
  if (loadedSettings)
    state = {
      ...state,
      settings: JSON.parse(loadedSettings),
    };
}

function fireAction(action: Action) {
  const lastState = state;
  state = update(state, action);

  if ("setSettings" in action)
    localStorage.setItem("settings", JSON.stringify(state.settings));

  updateScreen(lastState, state);
}

function startSpeaking(offset: number, text: string) {
  speechSynthesis.cancel();
  currentUtterance = new SpeechSynthesisUtterance(text);
  const selectedVoice = speechSynthesis
    .getVoices()
    .find((v) => v.voiceURI === state.settings.voiceUri);
  if (selectedVoice) currentUtterance.voice = selectedVoice;
  currentUtterance.rate = state.settings.rate;
  currentUtterance.onstart = (_e) => fireAction({ playingPosition: offset });
  currentUtterance.onboundary = (e) =>
    fireAction({ playingPosition: offset + e.charIndex });
  currentUtterance.onend = (e) =>
    fireAction({ stoppedSpeech: { error: false } });
  currentUtterance.onerror = (e) =>
    fireAction({ stoppedSpeech: { error: true } });
  speechSynthesis.speak(currentUtterance);
}

function onClick(e: MouseEvent) {
  if (e.target instanceof HTMLElement) {
    if (e.target.matches("main.input-text-screen > div >button")) {
      const phrases = e.target.matches(".phrases");
      const textArea = document.querySelector("textarea");
      if (textArea instanceof HTMLTextAreaElement)
        fireAction({
          inputText: {
            text: textArea.value,
            mode: phrases ? "phrases" : "sentences",
          },
        });
      else throw new Error(`Could not find textarea`);
    }

    if (e.target.matches("main.reader-screen > .controls .play")) {
      if ("read" in state && "pausedAt" in state.read.playState) {
        const sentence = state.read.sentences[state.read.current];
        const speechStr = sentence.substr(state.read.playState.pausedAt);
        startSpeaking(state.read.playState.pausedAt, speechStr);
      }
    }

    if (e.target.matches("main.reader-screen > .controls .pause")) {
      speechSynthesis.cancel();
    }

    if (e.target.matches("main.reader-screen > .controls .prev"))
      fireAction({ changeSentence: -1 });
    if (e.target.matches("main.reader-screen > .controls .next"))
      fireAction({ changeSentence: 1 });
    if (e.target.matches("main.reader-screen > .controls .back"))
      fireAction({ selectText: true });

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
      const settings = {
        ...state.settings,
        voiceUri:
          e.target.parentElement?.parentElement?.getAttribute("data-voice") ||
          undefined,
      };
      localStorage.setItem("settings", JSON.stringify(settings));
      fireAction({ voiceConfirmed: settings });
    }

    if (
      e.target.matches("main.reader-screen > .sentences > .current") ||
      e.target.matches(
        "main.reader-screen > .sentences > .current > .after-paused"
      )
    ) {
      const selection = window.getSelection();
      if (selection && selectionLength(selection) === 0) {
        const afterCursor =
          selection.focusNode?.parentElement?.matches(".after-paused") || false;
        const offset = selection.focusOffset;
        fireAction({ movePaused: { afterCursor, offset } });
      }
    }
  }
}

function onChange(e: Event) {
  if (
    e.target instanceof HTMLSelectElement &&
    e.target.matches("main.reader-screen > .controls .rate")
  ) {
    const rate = parseFloat(e.target.value);
    fireAction({ setSettings: { rate } });
  }
}

document.body.addEventListener("click", onClick);
document.body.addEventListener("change", onChange);

speechSynthesis.getVoices();
updateScreen(undefined, state);

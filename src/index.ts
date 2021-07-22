import { defaultState, Action, AppState } from "./logic.js";
import { update } from "./update.js";
import { updateScreen } from "./render.js";
import { selectionLength } from "./selection.js";

let userStopped = false;
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
  userStopped = false;
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
    fireAction({ stoppedSpeech: userStopped ? "paused" : "finished" });
  currentUtterance.onerror = (e) => fireAction({ stoppedSpeech: "error" });
  speechSynthesis.speak(currentUtterance);
}

function toggleSpeaking() {
  if ("read" in state) {
    if ("pausedAt" in state.read.playState) {
      const sentence = state.read.sentences[state.read.current];
      const speechStr = sentence.substr(state.read.playState.pausedAt);
      startSpeaking(state.read.playState.pausedAt, speechStr);
    } else if ("playing" in state.read.playState) {
      userStopped = true;
      speechSynthesis.cancel();
    }
  }
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

    if (e.target.matches("main.reader-screen > .controls .play"))
      toggleSpeaking();

    if (e.target.matches("main.reader-screen > .controls .pause"))
      toggleSpeaking();

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

function onKeyDown(e: KeyboardEvent) {
  if ("read" in state) {
    if (e.key === "ArrowUp") fireAction({ changeSentence: -1 });
    if (e.key === "ArrowDown") fireAction({ changeSentence: 1 });
    if (e.key === " ") toggleSpeaking();
    if (e.key === "ArrowLeft") fireAction({ moveBackWord: true });
  }
}

document.body.addEventListener("click", onClick);
document.body.addEventListener("change", onChange);
document.body.addEventListener("keydown", onKeyDown);

speechSynthesis.getVoices();
updateScreen(undefined, state);

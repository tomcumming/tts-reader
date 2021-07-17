import { defaultState, Action, update } from "./logic.js";
import { updateScreen } from "./render.js";

let currentUtterance: undefined | SpeechSynthesisUtterance;

let state = defaultState;

function fireAction(action: Action) {
  const lastState = state;
  state = update(state, action);
  updateScreen(lastState, state);
}

function startSpeaking(offset: number, text: string) {
  currentUtterance = new SpeechSynthesisUtterance(text);
  currentUtterance.addEventListener("start", (e) => console.log("start", e));
  currentUtterance.addEventListener("boundary", (e) =>
    console.log("boundry", e)
  );
  currentUtterance.addEventListener("end", (e) => console.log("end", e));
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

    if (e.target.matches("main.reader-screen > .controls > .play")) {
      if ("read" in state && "pausedAt" in state.read.playState) {
        const sentence = state.read.sentences[state.read.current];
        const speechStr = sentence.substr(state.read.playState.pausedAt);
        startSpeaking(state.read.playState.pausedAt, sentence);
      }
    }
  }
}

document.body.addEventListener("click", onClick);

updateScreen(undefined, state);

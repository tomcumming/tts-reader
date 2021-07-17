import { defaultState, Action, update } from "./logic.js";
import { updateScreen } from "./render.js";

let state = defaultState;

function fireAction(action: Action) {
  const lastState = state;
  state = update(state, action);
  updateScreen(lastState, state);
}

function onClick(e: MouseEvent) {
  if (e.target instanceof HTMLElement) {
    if (e.target.matches("main.input-text-screen > button")) {
      const textArea = document.querySelector("textarea");
      if (textArea instanceof HTMLTextAreaElement)
        fireAction({ inputText: textArea.value });
      else throw new Error(`Could not find textarea`);
    }
  }
}

document.body.addEventListener("click", onClick);

updateScreen(undefined, state);

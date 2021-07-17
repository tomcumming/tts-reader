import { AppState, InputTextState, ReadState } from "./logic.js";

const textInputTemplate = document.querySelector(
  "#text-input-screen"
) as HTMLTemplateElement;
const readerTemplate = document.querySelector(
  "#reader-screen"
) as HTMLTemplateElement;

function replaceMain(newElement: HTMLElement) {
  const mainElement = document.querySelector("main");
  if (mainElement instanceof HTMLElement) mainElement.replaceWith(newElement);
  else throw new Error(`Could not find main element`);
}

export function updateScreen(lastState: undefined | AppState, state: AppState) {
  if ("inputText" in state) createInputTextScreen(state.inputText);
  else if ("read" in state) {
    if (lastState && "read" in lastState)
      updateReadScreen(lastState.read, state.read);
    else createReadScreen(state.read);
  } else throw new Error(`Unexpected state`);
}

function createInputTextScreen(state: InputTextState) {
  const nodes = textInputTemplate.content.cloneNode(true);

  const main = document.createElement("main");
  main.className = "input-text-screen";
  main.appendChild(nodes);

  replaceMain(main);
}

function updateReadScreen(lastState: ReadState, state: ReadState) {}

function createReadScreen(state: ReadState) {
  const nodes = readerTemplate.content.cloneNode(true);

  const main = document.createElement("main");
  main.className = "reader-screen";
  main.appendChild(nodes);

  replaceMain(main);
}

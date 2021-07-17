import { AppState, InputTextState, ReadState, PlayState } from "./logic.js";

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

function clearChildren(element: HTMLElement) {
  while (element.firstChild) element.removeChild(element.firstChild);
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

  renderPreviousSentences(main, undefined, state);
  renderCurrentSentence(main, undefined, state);
  renderFutureSentences(main, undefined, state);

  replaceMain(main);
}

function renderCurrentSentence(
  parent: HTMLElement,
  lastState: undefined | ReadState,
  state: ReadState
) {
  if (lastState && state === lastState) return; // skip

  const sentence = state.sentences[state.current];

  const element = parent.querySelector(":scope > .sentences > .current");
  if (!(element instanceof HTMLElement))
    throw new Error(`Can't find current sentence element`);

  clearChildren(element);

  const playState = state.playState;

  if ("pausedAt" in playState) {
    const before = sentence.substr(0, playState.pausedAt);
    const after = sentence.substr(playState.pausedAt);

    element.appendChild(document.createTextNode(before));

    const afterElement = document.createElement("span");
    afterElement.className = "after-paused";
    afterElement.appendChild(document.createTextNode(after));

    element.appendChild(afterElement);
  } else throw new Error(`TODO other playstates`);
}

function renderPreviousSentences(
  parentElement: HTMLElement,
  lastState: undefined | ReadState,
  state: ReadState
) {
  if (
    lastState &&
    lastState.current === state.current &&
    lastState.sentences === state.sentences
  ) {
    // skip
  } else {
    const element = parentElement.querySelector(":scope > .sentences > .past");
    if (element instanceof HTMLUListElement) {
      clearChildren(element);
      for (const sentence of state.sentences.slice(0, state.current)) {
        const li = document.createElement("li");
        li.appendChild(document.createTextNode(sentence));
        element.appendChild(li);
      }
    } else throw new Error(`Can't find previous sentence list`);
  }
}

function renderFutureSentences(
  parentElement: HTMLElement,
  lastState: undefined | ReadState,
  state: ReadState
) {
  if (
    lastState &&
    lastState.current === state.current &&
    lastState.sentences === state.sentences
  ) {
    // skip
  } else {
    const element = parentElement.querySelector(
      ":scope > .sentences > .future"
    );
    if (element instanceof HTMLUListElement) {
      clearChildren(element);
      for (const sentence of state.sentences.slice(state.current + 1)) {
        const li = document.createElement("li");
        li.appendChild(document.createTextNode(sentence));
        element.appendChild(li);
      }
    } else throw new Error(`Can't find future sentence list`);
  }
}

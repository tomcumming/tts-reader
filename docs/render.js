const textInputTemplate = document.querySelector("#text-input-screen");
const readerTemplate = document.querySelector("#reader-screen");
const selectVoiceTemplate = document.querySelector("#select-voice-screen");
function replaceMain(newElement) {
    const mainElement = document.querySelector("main");
    if (mainElement instanceof HTMLElement)
        mainElement.replaceWith(newElement);
    else
        throw new Error(`Could not find main element`);
}
function clearChildren(element) {
    while (element.firstChild)
        element.removeChild(element.firstChild);
}
export function updateScreen(lastState, state) {
    if ("inputText" in state)
        createInputTextScreen(state.inputText);
    else if ("read" in state) {
        if (lastState && "read" in lastState)
            updateReadScreen(state.settings, lastState.read, state.read);
        else
            createReadScreen(state.settings, state.read);
    }
    else if ("selectVoice" in state) {
        createSelectVoiceScreen(state.selectVoice);
    }
    else
        throw new Error(`Unexpected state`);
}
function createInputTextScreen(state) {
    const nodes = textInputTemplate.content.cloneNode(true);
    const main = document.createElement("main");
    main.className = "input-text-screen";
    main.appendChild(nodes);
    replaceMain(main);
}
function updateReadScreen(settings, lastState, state) {
    const main = document.querySelector("main.reader-screen");
    if (!(main instanceof HTMLElement))
        throw new Error(`Can't find existing main`);
    renderPreviousSentences(main, lastState, state);
    renderCurrentSentence(main, lastState, state);
    renderFutureSentences(main, lastState, state);
    updateReadControls(main, settings, state);
}
function updateReadControls(parent, settings, state) {
    const playButton = parent.querySelector(":scope > .controls .button.play");
    const pauseButton = parent.querySelector(":scope > .controls .button.pause");
    const prevButton = parent.querySelector(":scope > .controls .button.prev");
    const nextButton = parent.querySelector(":scope > .controls .button.next");
    if (playButton)
        playButton.hidden = "playing" in state.playState;
    if (pauseButton)
        pauseButton.hidden = "pausedAt" in state.playState;
    if (prevButton instanceof HTMLButtonElement)
        prevButton.disabled = "playing" in state.playState || state.current === 0;
    if (nextButton instanceof HTMLButtonElement)
        nextButton.disabled =
            "playing" in state.playState ||
                state.current + 1 >= state.sentences.length;
    const rateSelect = parent.querySelector(":scope > .controls select.rate");
    if (rateSelect)
        rateSelect.value = settings.rate.toFixed(2);
}
function createReadScreen(settings, state) {
    const nodes = readerTemplate.content.cloneNode(true);
    const main = document.createElement("main");
    main.className = "reader-screen";
    main.appendChild(nodes);
    renderPreviousSentences(main, undefined, state);
    renderCurrentSentence(main, undefined, state);
    renderFutureSentences(main, undefined, state);
    updateReadControls(main, settings, state);
    replaceMain(main);
}
function renderCurrentSentence(parent, lastState, state) {
    if (lastState && state === lastState)
        return; // skip
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
    }
    else if ("playing" in playState) {
        const before = sentence.substr(0, playState.playing.position);
        const after = sentence.substr(playState.playing.position);
        element.appendChild(document.createTextNode(before));
        const afterElement = document.createElement("span");
        afterElement.className = "after-playing";
        afterElement.appendChild(document.createTextNode(after));
        element.appendChild(afterElement);
    }
    else
        throw new Error("Unexpected playState");
}
function renderPreviousSentences(parentElement, lastState, state) {
    if (lastState &&
        lastState.current === state.current &&
        lastState.sentences === state.sentences) {
        // skip
    }
    else {
        const element = parentElement.querySelector(":scope > .sentences > .past");
        if (element instanceof HTMLUListElement) {
            clearChildren(element);
            for (const sentence of state.sentences.slice(0, state.current)) {
                const li = document.createElement("li");
                li.appendChild(document.createTextNode(sentence));
                element.appendChild(li);
            }
        }
        else
            throw new Error(`Can't find previous sentence list`);
    }
}
function renderFutureSentences(parentElement, lastState, state) {
    if (lastState &&
        lastState.current === state.current &&
        lastState.sentences === state.sentences) {
        // skip
    }
    else {
        const element = parentElement.querySelector(":scope > .sentences > .future");
        if (element instanceof HTMLUListElement) {
            clearChildren(element);
            for (const sentence of state.sentences.slice(state.current + 1)) {
                const li = document.createElement("li");
                li.appendChild(document.createTextNode(sentence));
                element.appendChild(li);
            }
        }
        else
            throw new Error(`Can't find future sentence list`);
    }
}
function createSelectVoiceScreen(state) {
    const nodes = selectVoiceTemplate.content.cloneNode(true);
    const tableBody = nodes.querySelector("tbody");
    if (!(tableBody instanceof HTMLElement))
        throw new Error(`Can't find voice table body`);
    for (const voice of state.voices) {
        const row = document.createElement("tr");
        row.setAttribute("data-voice", voice.voiceURI);
        for (const text of [
            voice.name,
            voice.lang,
            voice.localService ? "Yes" : "No",
        ]) {
            const td = document.createElement("td");
            td.appendChild(document.createTextNode(text));
            row.appendChild(td);
        }
        const btn = document.createElement("button");
        btn.className = "button";
        btn.appendChild(document.createTextNode("Select"));
        const td = document.createElement("td");
        td.appendChild(btn);
        row.appendChild(td);
        tableBody.appendChild(row);
    }
    {
        const row = document.createElement("tr");
        const btn = document.createElement("button");
        btn.className = "button";
        btn.appendChild(document.createTextNode("Cancel"));
        const td = document.createElement("td");
        td.colSpan = 4;
        td.appendChild(btn);
        row.appendChild(td);
        tableBody.appendChild(row);
    }
    const main = document.createElement("main");
    main.className = "select-voice-screen";
    main.appendChild(nodes);
    replaceMain(main);
}

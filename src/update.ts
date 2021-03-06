import {
  AppState,
  Action,
  sentences,
  Settings,
  moveToLastWord,
} from "./logic.js";

export function update(state: AppState, action: Action): AppState {
  if ("inputText" in action)
    return inputText(state, action.inputText.text, action.inputText.mode);
  else if ("playingPosition" in action)
    return playingPosition(state, action.playingPosition);
  else if ("movePaused" in action)
    return movePaused(
      state,
      action.movePaused.afterCursor,
      action.movePaused.offset
    );
  else if ("stoppedSpeech" in action)
    return stoppedSpeech(state, action.stoppedSpeech);
  else if ("selectVoice" in action)
    return selectVoice(state, action.selectVoice.voices);
  else if ("voiceConfirmed" in action)
    return voiceConfirmed(state, action.voiceConfirmed);
  else if ("setSettings" in action)
    return updateSettings(state, action.setSettings);
  else if ("changeSentence" in action)
    return changeSentence(state, action.changeSentence);
  else if ("selectText" in action) return selectText(state);
  else if ("moveBackWord" in action) return moveBackWord(state);

  throw new Error(`Unexpected action`);
}

function inputText(
  state: AppState,
  text: string,
  mode: "phrases" | "sentences"
): AppState {
  const sents = Array.from(sentences(text, mode));
  if (sents.length === 0) throw new Error(`TODO render error`);

  return {
    settings: state.settings,
    read: {
      sentences: sents,
      current: 0,
      playState: { pausedAt: 0 },
    },
  };
}

function playingPosition(state: AppState, position: number): AppState {
  if ("read" in state) {
    return {
      settings: state.settings,
      read: {
        ...state.read,
        playState: { playing: { position } },
      },
    };
  } else {
    console.debug("Update playing pos while not on read screen");
    return state;
  }
}

function movePaused(
  state: AppState,
  afterCursor: boolean,
  offset: number
): AppState {
  if ("read" in state && "pausedAt" in state.read.playState) {
    const pausedAt = afterCursor
      ? state.read.playState.pausedAt + offset
      : offset;
    return {
      settings: state.settings,
      read: {
        ...state.read,
        playState: { pausedAt },
      },
    };
  } else {
    console.debug("Moved paused position while not paused");
    return state;
  }
}

function stoppedSpeech(
  state: AppState,
  reason: "error" | "paused" | "finished"
): AppState {
  if ("read" in state) {
    return {
      settings: state.settings,
      read: {
        ...state.read,
        playState: {
          pausedAt:
            `playing` in state.read.playState && reason === "paused"
              ? state.read.playState.playing.position
              : 0,
        },
      },
    };
  } else {
    console.debug("Finished speech while not on read screen");
    return state;
  }
}

function selectVoice(
  state: AppState,
  voices: SpeechSynthesisVoice[]
): AppState {
  const backTo =
    "read" in state
      ? { sentences: state.read.sentences, current: state.read.current }
      : undefined;

  return {
    settings: state.settings,
    selectVoice: {
      voices: voices,
      backTo,
    },
  };
}

function voiceConfirmed(state: AppState, settings: Settings): AppState {
  if ("selectVoice" in state && state.selectVoice.backTo) {
    return {
      settings,
      read: {
        sentences: state.selectVoice.backTo.sentences,
        current: state.selectVoice.backTo.current,
        playState: { pausedAt: 0 },
      },
    };
  } else {
    return { settings: state.settings, inputText: true };
  }
}

function updateSettings(
  state: AppState,
  settings: Partial<Settings>
): AppState {
  return {
    ...state,
    settings: {
      ...state.settings,
      ...settings,
    },
  };
}

function changeSentence(state: AppState, delta: number): AppState {
  if ("read" in state && "pausedAt" in state.read.playState) {
    return {
      settings: state.settings,
      read: {
        playState: { pausedAt: 0 },
        current: Math.max(
          0,
          Math.min(state.read.sentences.length - 1, state.read.current + delta)
        ),
        sentences: state.read.sentences,
      },
    };
  } else {
    console.warn("Changed sentence while not reading paused");
    return state;
  }
}

function selectText(state: AppState): AppState {
  return {
    settings: state.settings,
    inputText: true,
  };
}

function moveBackWord(state: AppState): AppState {
  if ("read" in state && "pausedAt" in state.read.playState) {
    const currentSentence = state.read.sentences[state.read.current];
    const newPosition = moveToLastWord(
      currentSentence,
      state.read.playState.pausedAt
    );
    return {
      settings: state.settings,
      read: {
        sentences: state.read.sentences,
        current: state.read.current,
        playState: { pausedAt: newPosition },
      },
    };
  } else {
    console.warn("Move back word while not reading paused");
    return state;
  }
}

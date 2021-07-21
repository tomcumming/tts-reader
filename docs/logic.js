export const defaultState = {
    inputText: true,
    settings: { rate: 1 },
};
const sentenceTerminator = /[．。︀!ǃ！?？]|\n|\.(?:\s|$)/mu;
const phraseTerminator = new RegExp(sentenceTerminator.source + `|[,，、，;；]`, "mu");
export function* sentences(inputText, mode) {
    while (inputText.length > 0) {
        const match = mode === "phrases"
            ? phraseTerminator.exec(inputText)
            : sentenceTerminator.exec(inputText);
        if (match) {
            const end = match.index + match[0].length;
            const line = inputText.substr(0, end).trim();
            inputText = inputText.substr(end);
            if (line.length > 0)
                yield line;
        }
        else {
            const line = inputText.trim();
            inputText = "";
            if (line.length > 0)
                yield line;
        }
    }
}

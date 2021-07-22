export const defaultState = {
    inputText: true,
    settings: { rate: 1 },
};
const sentenceTerminator = /[．。︀!ǃ！?？]|\n|\.(?:\s|$)/mu;
const phraseTerminator = new RegExp(sentenceTerminator.source + `|[，、，;；]|,(?:\\D|$)`, "mu");
const nonWsSep = /\p{Script=Han}/u;
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
export function moveToLastWord(sentence, position) {
    let chars = Array.from(sentence.slice(0, position));
    // skip white space
    while (chars.length && /\s/u.test(chars[chars.length - 1]))
        chars = chars.slice(0, chars.length - 1);
    if (chars.length && nonWsSep.test(chars[chars.length - 1])) {
        // Skip one Han character
        chars = chars.slice(0, chars.length - 1);
    }
    else {
        // Skip to next WS
        while (chars.length && /\S/u.test(chars[chars.length - 1]))
            chars = chars.slice(0, chars.length - 1);
    }
    return chars.reduce((p, c) => p + c.length, 0);
}

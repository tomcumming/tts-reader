export const selectionLength = (selection: Selection) =>
  new Array(selection.rangeCount)
    .fill(false)
    .map((_, idx) => selection.getRangeAt(idx))
    .reduce((p, range) => p + range.toString().length, 0);

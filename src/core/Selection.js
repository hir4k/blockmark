export class Selection {
    static placeCaretAtEnd(el) {
        if (!el || el.childNodes.length === 0) return;

        const range = document.createRange();
        const selection = window.getSelection();

        range.selectNodeContents(el);
        range.collapse(false); // false = move to end

        selection.removeAllRanges();
        selection.addRange(range);
    }
}

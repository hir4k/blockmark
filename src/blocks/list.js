export class List {
    constructor({ data = {}, onBackspace }) {
        this.style = data.style || 'unordered'; // 'ordered' also supported
        this.items = data.items || [''];
        this.onBackspace = onBackspace;

        this.element = document.createElement(this.style === 'ordered' ? 'ol' : 'ul');
        this.element.className = 'list-block';
        this.element.contentEditable = false; // we'll make each <li> editable
    }

    render() {
        this.element.innerHTML = ''; // clear

        this.items.forEach((text, index) => {
            const li = this._createItem(text, index);
            this.element.appendChild(li);
        });

        // Ensure at least one <li>
        if (this.element.children.length === 0) {
            this.element.appendChild(this._createItem('', 0));
        }

        return this.element;
    }

    _createItem(text = '', index) {
        const li = document.createElement('li');
        li.contentEditable = true;
        li.textContent = text;

        li.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const newLi = this._createItem('', index + 1);
                this.element.insertBefore(newLi, li.nextSibling);
                setTimeout(() => newLi.focus(), 0);
            }

            if (e.key === 'Backspace' && li.textContent.trim() === '') {
                if (this.element.children.length === 1) {
                    e.preventDefault();
                    this.onBackspace?.();
                } else {
                    const prev = li.previousSibling;
                    li.remove();
                    if (prev?.focus) {
                        prev.focus();
                        import('../core/Selection.js').then(({ Selection }) => {
                            Selection.placeCaretAtEnd(prev);
                        });
                    }
                    e.preventDefault();
                }
            }
        });

        return li;
    }

    save() {
        const items = [];
        for (const li of this.element.children) {
            items.push(li.textContent.trim());
        }

        return {
            style: this.style,
            items
        };
    }
}

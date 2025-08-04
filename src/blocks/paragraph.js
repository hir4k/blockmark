export class Paragraph {
    constructor({ data, onEnter, onBackspace }) {
        this.data = data.text || '';
        this.onEnter = onEnter;
        this.onBackspace = onBackspace;
        this.element = document.createElement('div');
        this.element.contentEditable = true;
        this.element.className = 'paragraph-block';
    }

    render() {
        this.element.innerHTML = this.data;

        this.element.addEventListener('input', () => {
            this.data = this.element.innerHTML;
        });

        this.element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.onEnter?.();
            }

            if (e.key === 'Backspace') {
                const text = this.element.textContent.trim();
                if (text === '') {
                    e.preventDefault();
                    this.onBackspace?.();
                }
            }
        });

        return this.element;
    }

    save() {
        return { text: this.element.innerHTML };
    }
}

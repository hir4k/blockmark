export class Paragraph {
    constructor({ data = {}, onEnter, onBackspace }) {
        this.data = data.text || [];
        this.onEnter = onEnter;
        this.onBackspace = onBackspace;
        this.element = document.createElement('div');
        this.element.contentEditable = true;
        this.element.className = 'paragraph-block';
        this.element.setAttribute('data-block-type', 'paragraph');
    }

    render() {
        this.element.innerHTML = this._renderText();

        this.element.addEventListener('input', () => {
            this._updateData();
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

        // Parse the initial data to ensure it's in the correct format
        this._updateData();

        return this.element;
    }

    _renderText() {
        if (this.data.length === 0) {
            return '<br>';
        }

        return this.data.map(segment => {
            let text = segment.text || '';
            let html = text;

            if (segment.bold) html = `<strong>${html}</strong>`;
            if (segment.italic) html = `<em>${html}</em>`;
            if (segment.underline) html = `<u>${html}</u>`;

            return html;
        }).join('');
    }

    _updateData() {
        // Parse HTML content to detect formatting
        this.data = this._parseHtmlContent(this.element.innerHTML);
    }

    _parseHtmlContent(html) {
        if (!html || html === '<br>') {
            return [{ text: '' }];
        }

        const segments = [];
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        // Recursively process text nodes and elements
        this._processNode(tempDiv, segments);

        return segments.length > 0 ? segments : [{ text: '' }];
    }

    _processNode(node, segments) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            if (text.trim()) {
                segments.push({ text });
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = node.tagName.toLowerCase();
            const children = Array.from(node.childNodes);

            if (children.length === 0) {
                // Self-closing or empty element
                return;
            }

            // Check if this element has formatting
            const formatting = {};
            if (tagName === 'strong' || tagName === 'b') formatting.bold = true;
            if (tagName === 'em' || tagName === 'i') formatting.italic = true;
            if (tagName === 'u') formatting.underline = true;

            if (Object.keys(formatting).length > 0) {
                // This element has formatting, process its children
                const childSegments = [];
                children.forEach(child => this._processNode(child, childSegments));

                // Apply formatting to all child segments
                childSegments.forEach(segment => {
                    segments.push({ ...segment, ...formatting });
                });
            } else {
                // No formatting, process children normally
                children.forEach(child => this._processNode(child, segments));
            }
        }
    }

    save() {
        return {
            type: 'paragraph',
            text: this.data
        };
    }
}
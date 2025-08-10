export class List {
    // Static metadata for block registry
    static type = 'list';
    static name = 'List';
    static icon = `<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="6" cy="10" r="2" fill="#ffffff"/><rect x="10" y="9" width="7" height="2" rx="1" fill="#ffffff"/></svg>`;
    static defaultData = { ordered: false, items: [] };

    // Static methods to get specific list types
    static getUnorderedList() {
        return {
            type: 'list',
            name: 'Bullet List',
            icon: `<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="6" cy="10" r="2" fill="#ffffff"/><rect x="10" y="9" width="7" height="2" rx="1" fill="#ffffff"/></svg>`,
            defaultData: { ordered: false, items: [] }
        };
    }

    static getOrderedList() {
        return {
            type: 'list',
            name: 'Numbered List',
            icon: `<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><text x="4" y="12" font-size="8" fill="#ffffff">1.</text><rect x="10" y="9" width="7" height="2" rx="1" fill="#ffffff"/></svg>`,
            defaultData: { ordered: true, items: [] }
        };
    }

    constructor({ data = {}, onBackspace }) {
        this.data = {
            ordered: data.ordered || false,
            items: data.items || []
        };
        this.onBackspace = onBackspace;

        this.element = document.createElement(this.data.ordered ? 'ol' : 'ul');
        this.element.className = 'list-block';
        this.element.setAttribute('data-block-type', 'list');
        this.element.contentEditable = false; // we'll make each <li> editable
    }

    render() {
        const listContainer = document.createElement('div');
        listContainer.className = 'list-container';

        const list = document.createElement(this.ordered ? 'ol' : 'ul');
        list.className = 'list-element';

        this.items.forEach((item, index) => {
            const li = document.createElement('li');
            li.textContent = item;
            li.contentEditable = true;
            li.addEventListener('input', () => {
                this.items[index] = li.textContent;
            });
            list.appendChild(li);
        });

        // Create controls
        const controls = document.createElement('div');
        controls.className = 'list-controls';

        const addItemBtn = document.createElement('button');
        addItemBtn.type = 'button';
        addItemBtn.className = 'list-add-item-btn';
        addItemBtn.textContent = 'Add Item';

        const removeItemBtn = document.createElement('button');
        removeItemBtn.type = 'button';
        removeItemBtn.className = 'list-remove-item-btn';
        removeItemBtn.textContent = 'Remove Item';

        controls.appendChild(addItemBtn);
        controls.appendChild(removeItemBtn);

        // Event handlers
        addItemBtn.addEventListener('click', () => {
            this.addItem();
            this.element.innerHTML = '';
            this.element.appendChild(this.render());
        });

        removeItemBtn.addEventListener('click', () => {
            if (this.items.length > 1) {
                this.removeItem();
                this.element.innerHTML = '';
                this.element.appendChild(this.render());
            }
        });

        listContainer.appendChild(list);
        listContainer.appendChild(controls);

        return listContainer;
    }

    _createItem(itemSegments = [], index) {
        const li = document.createElement('li');
        li.contentEditable = true;
        li.setAttribute('data-item-index', index);

        // Render the text segments
        li.innerHTML = this._renderTextSegments(itemSegments);

        li.addEventListener('input', () => {
            this._updateItemData(index, li);
        });

        li.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const newIndex = index + 1;
                const newLi = this._createItem([], newIndex);
                this.element.insertBefore(newLi, li.nextSibling);

                // Update indices for all subsequent items
                this._updateIndices();

                setTimeout(() => newLi.focus(), 0);
            }

            if (e.key === 'Backspace' && li.textContent.trim() === '') {
                if (this.element.children.length === 1) {
                    e.preventDefault();
                    this.onBackspace?.();
                } else {
                    const prev = li.previousSibling;
                    li.remove();
                    this._updateIndices();

                    if (prev?.focus) {
                        prev.focus();
                        // Place caret at end
                        const range = document.createRange();
                        const selection = window.getSelection();
                        range.selectNodeContents(prev);
                        range.collapse(false);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }
                    e.preventDefault();
                }
            }
        });

        // Add paste event handler to convert HTML to plain text
        li.addEventListener('paste', (e) => {
            e.preventDefault();

            // Get plain text from clipboard
            const text = e.clipboardData.getData('text/plain');

            // Normalize text: remove line breaks and extra whitespace
            const normalizedText = text.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();

            // Insert the normalized plain text at cursor position
            document.execCommand('insertText', false, normalizedText);
        });

        return li;
    }

    _renderTextSegments(segments) {
        if (segments.length === 0) {
            return '<br>';
        }

        return segments.map(segment => {
            let text = segment.text || '';
            let html = text;

            if (segment.bold) html = `<strong>${html}</strong>`;
            if (segment.italic) html = `<em>${html}</em>`;
            if (segment.underline) html = `<u>${html}</u>`;

            return html;
        }).join('');
    }

    _updateItemData(index, li) {
        // Parse HTML content to detect formatting
        const segments = this._parseHtmlContent(li.innerHTML);
        this.data.items[index] = segments;
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

    _updateIndices() {
        const items = this.element.querySelectorAll('li');
        items.forEach((li, index) => {
            li.setAttribute('data-item-index', index);
        });
    }

    _updateAllItemsData() {
        const listItems = this.element.querySelectorAll('li');

        // Only update if we have rendered items that don't match our data
        if (listItems.length !== this.data.items.length) {
            this.data.items = [];
            listItems.forEach((li, index) => {
                const segments = this._parseHtmlContent(li.innerHTML);
                this.data.items[index] = segments;
            });
        } else {
            // Update existing data with parsed HTML
            listItems.forEach((li, index) => {
                const segments = this._parseHtmlContent(li.innerHTML);
                this.data.items[index] = segments;
            });
        }
    }

    save() {
        // Collect all items data by parsing current HTML
        const items = [];
        const listItems = this.element.querySelectorAll('li');

        listItems.forEach(li => {
            const segments = this._parseHtmlContent(li.innerHTML);
            items.push(segments);
        });

        return {
            type: 'list',
            ordered: this.data.ordered,
            items
        };
    }
} 
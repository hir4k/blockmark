export class Table {
    // Static metadata for block registry
    static type = 'table';
    static name = 'Table';
    static icon = `<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="3" y="3" width="14" height="14" rx="1" stroke="#ffffff" stroke-width="1.5"/><line x1="7" y1="3" x2="7" y2="17" stroke="#ffffff" stroke-width="1.5"/><line x1="13" y1="3" x2="13" y2="17" stroke="#ffffff" stroke-width="1.5"/><line x1="3" y1="7" x2="17" y2="7" stroke="#ffffff" stroke-width="1.5"/><line x1="3" y1="11" x2="17" y2="11" stroke="#ffffff" stroke-width="1.5"/></svg>`;
    static defaultData = {
        rows: 2,
        columns: 2,
        cells: []
    };

    constructor({ data = {}, onBackspace }) {
        this.data = {
            rows: data.rows || 3,
            columns: data.columns || 3,
            cells: data.cells || []
        };
        this.onBackspace = onBackspace;

        this.element = document.createElement('div');
        this.element.className = 'table-block';
        this.element.setAttribute('data-block-type', 'table');
        this.element.contentEditable = false;
    }

    render() {
        this.element.innerHTML = '';

        // Create table container
        const tableContainer = document.createElement('div');
        tableContainer.style.cssText = `
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            overflow: hidden;
            margin: 8px 0;
        `;

        // Create table element
        const table = document.createElement('table');
        table.style.cssText = `
            width: 100%;
            border-collapse: collapse;
            background: white;
        `;

        // Create table body
        const tbody = document.createElement('tbody');

        // Initialize cells if empty
        if (this.data.cells.length === 0) {
            this._initializeCells();
        }

        // Render rows
        for (let rowIndex = 0; rowIndex < this.data.rows; rowIndex++) {
            const tr = document.createElement('tr');

            for (let colIndex = 0; colIndex < this.data.columns; colIndex++) {
                const cellIndex = rowIndex * this.data.columns + colIndex;
                const cellData = this.data.cells[cellIndex] || { text: [] };

                const td = this._createCell(cellData, rowIndex, colIndex);
                tr.appendChild(td);
            }

            tbody.appendChild(tr);
        }

        table.appendChild(tbody);
        tableContainer.appendChild(table);

        // Add table controls
        const controls = this._createTableControls();
        tableContainer.appendChild(controls);

        this.element.appendChild(tableContainer);
        return this.element;
    }

    _initializeCells() {
        this.data.cells = [];
        for (let i = 0; i < this.data.rows * this.data.columns; i++) {
            this.data.cells.push({ text: [] });
        }
    }

    _createCell(cellData, rowIndex, colIndex) {
        const td = document.createElement('td');
        td.contentEditable = true;
        td.setAttribute('data-row', rowIndex);
        td.setAttribute('data-col', colIndex);
        td.style.cssText = `
            border: 1px solid #e2e8f0;
            padding: 8px 12px;
            min-width: 80px;
            min-height: 40px;
            vertical-align: top;
        `;

        // Render cell content
        td.innerHTML = this._renderTextSegments(cellData.text || []);

        // Add event listeners
        td.addEventListener('input', () => {
            this._updateCellData(rowIndex, colIndex, td);
        });

        td.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                this._navigateToNextCell(rowIndex, colIndex, e.shiftKey);
            }
        });

        // Add paste event handler to convert HTML to plain text
        td.addEventListener('paste', (e) => {
            e.preventDefault();

            // Get plain text from clipboard
            const text = e.clipboardData.getData('text/plain');

            // Normalize text: remove line breaks and extra whitespace
            const normalizedText = text.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();

            // Insert the normalized plain text at cursor position
            document.execCommand('insertText', false, normalizedText);
        });

        return td;
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

    _updateCellData(rowIndex, colIndex, td) {
        const cellIndex = rowIndex * this.data.columns + colIndex;
        const segments = this._parseHtmlContent(td.innerHTML);
        this.data.cells[cellIndex] = { text: segments };
    }

    _parseHtmlContent(html) {
        if (!html || html === '<br>') {
            return [{ text: '' }];
        }

        const segments = [];
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

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
                return;
            }

            const formatting = {};
            if (tagName === 'strong' || tagName === 'b') formatting.bold = true;
            if (tagName === 'em' || tagName === 'i') formatting.italic = true;
            if (tagName === 'u') formatting.underline = true;

            if (Object.keys(formatting).length > 0) {
                const childSegments = [];
                children.forEach(child => this._processNode(child, childSegments));
                childSegments.forEach(segment => {
                    segments.push({ ...segment, ...formatting });
                });
            } else {
                children.forEach(child => this._processNode(child, segments));
            }
        }
    }

    _navigateToNextCell(currentRow, currentCol, reverse = false) {
        const cells = this.element.querySelectorAll('td[contenteditable="true"]');
        let nextIndex = -1;

        if (reverse) {
            // Navigate backwards
            for (let i = cells.length - 1; i >= 0; i--) {
                const cell = cells[i];
                const row = parseInt(cell.getAttribute('data-row'));
                const col = parseInt(cell.getAttribute('data-col'));

                if ((row === currentRow && col < currentCol) || row < currentRow) {
                    nextIndex = i;
                    break;
                }
            }
        } else {
            // Navigate forwards
            for (let i = 0; i < cells.length; i++) {
                const cell = cells[i];
                const row = parseInt(cell.getAttribute('data-row'));
                const col = parseInt(cell.getAttribute('data-col'));

                if ((row === currentRow && col > currentCol) || row > currentRow) {
                    nextIndex = i;
                    break;
                }
            }
        }

        if (nextIndex >= 0) {
            cells[nextIndex].focus();
        }
    }

    _createTableControls() {
        const controls = document.createElement('div');
        controls.style.cssText = `
            display: flex;
            gap: 8px;
            padding: 8px;
            background: #f8fafc;
            border-top: 1px solid #e2e8f0;
        `;

        // Add row button
        const addRowBtn = document.createElement('button');
        addRowBtn.textContent = '+ Row';
        addRowBtn.style.cssText = `
            padding: 4px 8px;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            background: white;
            cursor: pointer;
            font-size: 12px;
        `;
        addRowBtn.addEventListener('click', () => this._addRow());

        // Add column button
        const addColBtn = document.createElement('button');
        addColBtn.textContent = '+ Column';
        addColBtn.style.cssText = `
            padding: 4px 8px;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            background: white;
            cursor: pointer;
            font-size: 12px;
        `;
        addColBtn.addEventListener('click', () => this._addColumn());

        // Remove row button
        const removeRowBtn = document.createElement('button');
        removeRowBtn.textContent = '- Row';
        removeRowBtn.style.cssText = `
            padding: 4px 8px;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            background: white;
            cursor: pointer;
            font-size: 12px;
        `;
        removeRowBtn.addEventListener('click', () => this._removeRow());

        // Remove column button
        const removeColBtn = document.createElement('button');
        removeColBtn.textContent = '- Column';
        removeColBtn.style.cssText = `
            padding: 4px 8px;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            background: white;
            cursor: pointer;
            font-size: 12px;
        `;
        removeColBtn.addEventListener('click', () => this._removeColumn());

        controls.appendChild(addRowBtn);
        controls.appendChild(addColBtn);
        controls.appendChild(removeRowBtn);
        controls.appendChild(removeColBtn);

        return controls;
    }

    _addRow() {
        this.data.rows++;

        // Add empty cells for the new row
        for (let col = 0; col < this.data.columns; col++) {
            this.data.cells.push({ text: [] });
        }

        this.render();
    }

    _addColumn() {
        this.data.columns++;

        // Insert empty cells for the new column
        const newCells = [];
        for (let row = 0; row < this.data.rows; row++) {
            // Insert empty cell at the end of each row
            const insertIndex = (row + 1) * this.data.columns - 1;
            this.data.cells.splice(insertIndex, 0, { text: [] });
        }

        this.render();
    }

    _removeRow() {
        if (this.data.rows <= 1) return;

        this.data.rows--;

        // Remove cells from the last row
        const cellsToRemove = this.data.columns;
        this.data.cells.splice(-cellsToRemove);

        this.render();
    }

    _removeColumn() {
        if (this.data.columns <= 1) return;

        this.data.columns--;

        // Remove cells from the last column
        const newCells = [];
        for (let row = 0; row < this.data.rows; row++) {
            const rowStart = row * (this.data.columns + 1);
            const rowEnd = rowStart + this.data.columns;
            newCells.push(...this.data.cells.slice(rowStart, rowEnd));
        }
        this.data.cells = newCells;

        this.render();
    }

    save() {
        // Collect all cells data
        const cells = [];
        const tableCells = this.element.querySelectorAll('td[contenteditable="true"]');

        tableCells.forEach(td => {
            const rowIndex = parseInt(td.getAttribute('data-row'));
            const colIndex = parseInt(td.getAttribute('data-col'));
            const segments = this._parseHtmlContent(td.innerHTML);
            const cellIndex = rowIndex * this.data.columns + colIndex;
            cells[cellIndex] = { text: segments };
        });

        return {
            type: 'table',
            rows: this.data.rows,
            columns: this.data.columns,
            cells: cells
        };
    }
} 
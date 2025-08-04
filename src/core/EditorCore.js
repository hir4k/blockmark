import { BlockManager } from './BlockManager.js';

export class EditorCore {
    constructor({ holder, tools = {} }) {
        this.holder = typeof holder === 'string' ? document.getElementById(holder) : holder;
        this.tools = tools;

        this.blockManager = new BlockManager({
            holder: this.holder,
            tools: this.tools
        });

        this.init();
    }

    init() {
        this._renderToolbar();
        this.blockManager.insertBlock('paragraph');
    }

    _renderToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'editor-toolbar';
        toolbar.style.display = 'flex';
        toolbar.style.gap = '8px';
        toolbar.style.marginBottom = '10px';

        for (const toolName in this.tools) {
            const button = document.createElement('button');
            button.textContent = toolName;
            button.onclick = () => this.insertBlock(toolName);
            toolbar.appendChild(button);
        }

        this.holder.prepend(toolbar);
    }

    insertBlock(type = 'paragraph', afterIndex = null) {
        this.blockManager.insertBlock(type, {}, afterIndex);
    }

    deleteBlock(index) {
        this.blockManager.deleteBlockAt(index);
    }

    save() {
        return this.blockManager.save();
    }
}

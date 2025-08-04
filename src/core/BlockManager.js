import { Selection } from './Selection.js';


export class BlockManager {
    constructor({ holder, tools }) {
        this.holder = holder;
        this.tools = tools;
        this.blocks = [];
    }


    insertBlock(type, data = {}, afterIndex = null) {
        const Tool = this.tools[type];
        if (!Tool) return;

        let toolInstance; // Declare early

        toolInstance = new Tool({
            data,
            onEnter: () => {
                const index = this.blocks.findIndex(b => b.instance === toolInstance);
                this.insertBlock(type, {}, index);
            },
            onBackspace: () => {
                const index = this.blocks.findIndex(b => b.instance === toolInstance);
                this.deleteBlockAt(index);
            }
        });

        const blockElement = toolInstance.render();
        blockElement.setAttribute('data-block-type', type);
        blockElement.classList.add('editor-block');

        const insertAt = afterIndex != null ? afterIndex + 1 : this.blocks.length;

        if (insertAt >= this.blocks.length) {
            this.holder.appendChild(blockElement);
        } else {
            this.holder.insertBefore(blockElement, this.holder.children[insertAt]);
        }

        this.blocks.splice(insertAt, 0, { type, instance: toolInstance });

        // Set focus
        setTimeout(() => toolInstance.element?.focus(), 0);
    }


    deleteBlockAt(index) {
        if (this.blocks.length <= 1) return;

        const { instance } = this.blocks[index];
        const element = instance.element;
        if (element && element.remove) {
            element.remove();
        }

        this.blocks.splice(index, 1);

        // Focus previous block and place caret at end
        const previous = this.blocks[index - 1];
        if (previous?.instance?.element?.focus) {
            previous.instance.element.focus();
            Selection.placeCaretAtEnd(previous.instance.element);
        }
    }


    save() {
        return this.blocks.map(({ type, instance }) => ({
            type,
            data: instance.save()
        }));
    }
}

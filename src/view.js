import { BlockRegistry } from './blocks/index.js';
import { Paragraph } from './blocks/paragraph.js';
import { List } from './blocks/list.js';

export default class View {
    /**
     * @param {HTMLElement | string} holder 
     */
    constructor(holder) {
        this.holder = typeof holder === "string" ? document.querySelector(holder) : holder;
        this.isMenuOpen = false;
        this.blocks = [];
        this.tools = {
            paragraph: Paragraph,
            list: List
        };
        this.setupEditorStructure();
        this.renderToolbar();
        this.createInitialBlock();
    }

    /**
     * Sets up the editor structure with toolbar and content area
     */
    setupEditorStructure() {
        // Create toolbar container
        this.toolbarContainer = document.createElement('div');
        this.toolbarContainer.className = 'bmark-toolbar-container';
        this.holder.appendChild(this.toolbarContainer);

        // Create content area
        this.contentArea = document.createElement('div');
        this.contentArea.className = 'bmark-content-area';
        this.holder.appendChild(this.contentArea);
    }

    /**
     * Creates the initial paragraph block
     */
    createInitialBlock() {
        this.addBlock('paragraph');
    }

    /**
     * Add a new block to the editor
     * @param {string} type - The block type
     * @param {Object} data - The block data
     * @param {number} afterIndex - Insert after this index (null for end)
     */
    addBlock(type, data = {}, afterIndex = null) {
        const Tool = this.tools[type];
        if (!Tool) {
            console.warn(`Unknown block type: ${type}`);
            return null;
        }

        let blockInstance;

        blockInstance = new Tool({
            data,
            onEnter: () => {
                const index = this.blocks.findIndex(b => b.instance === blockInstance);
                this.addBlock(type, {}, index);
            },
            onBackspace: () => {
                const index = this.blocks.findIndex(b => b.instance === blockInstance);
                this.removeBlock(index);
            }
        });

        const blockElement = blockInstance.render();
        blockElement.setAttribute('data-block-type', type);
        blockElement.classList.add('editor-block');

        const insertAt = afterIndex != null ? afterIndex + 1 : this.blocks.length;

        if (insertAt >= this.blocks.length) {
            this.contentArea.appendChild(blockElement);
        } else {
            this.contentArea.insertBefore(blockElement, this.contentArea.children[insertAt]);
        }

        this.blocks.splice(insertAt, 0, { type, instance: blockInstance });

        // Set focus
        setTimeout(() => blockInstance.element?.focus(), 0);

        return blockInstance;
    }

    /**
     * Remove a block from the editor
     * @param {number} index - The index of the block to remove
     */
    removeBlock(index) {
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
            this.placeCaretAtEnd(previous.instance.element);
        }
    }

    /**
     * Place caret at the end of an element
     * @param {HTMLElement} element - The element to place caret in
     */
    placeCaretAtEnd(element) {
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(element);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
    }

    /**
     * Get all blocks data for saving
     * @returns {Array} Array of block data
     */
    getBlocksData() {
        return this.blocks.map(({ type, instance }) => {
            const savedData = instance.save();
            return savedData;
        });
    }

    /**
     * Load blocks from data
     * @param {Array} data - Array of block data
     */
    loadBlocks(data) {
        // Clear existing blocks
        this.blocks.forEach(({ instance }) => {
            if (instance.element && instance.element.remove) {
                instance.element.remove();
            }
        });
        this.blocks = [];

        // Load new blocks
        data.forEach(blockData => {
            const { type, ...data } = blockData;
            this.addBlock(type, data);
        });
    }

    /**
     * Renders a toolbar with a plus button that shows a dropdown menu of available blocks.
     */
    renderToolbar() {
        // Create toolbar container
        const toolbar = document.createElement('div');
        toolbar.className = 'bmark-toolbar';
        toolbar.style.cssText = `
            display: flex;
            gap: 8px;
            align-items: center;
            position: relative;
            z-index: 1000;
        `;

        // Create plus button
        const plusButton = document.createElement('button');
        plusButton.type = 'button';
        plusButton.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M10 3v14M3 10h14" stroke="#334155" stroke-width="2" stroke-linecap="round"/>
            </svg>
        `;
        plusButton.title = 'Add Block';
        plusButton.style.cssText = `
            background: white;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 8px;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        // Hover effects
        plusButton.onmouseover = () => {
            plusButton.style.background = '#f1f5f9';
            plusButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        };
        plusButton.onmouseout = () => {
            plusButton.style.background = 'white';
            plusButton.style.boxShadow = 'none';
        };

        // Create dropdown menu container
        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'bmark-dropdown-container';
        dropdownContainer.style.cssText = `
            position: absolute;
            top: 100%;
            left: 8px;
            z-index: 1001;
            display: none;
        `;

        // Create pointing arrow
        const arrow = document.createElement('div');
        arrow.style.cssText = `
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-bottom: 8px solid #1a1a1a;
            margin-left: 12px;
            margin-bottom: -1px;
        `;

        // Create dropdown menu
        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = 'bmark-dropdown-menu';
        dropdownMenu.style.cssText = `
            background: #1a1a1a;
            border-radius: 8px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            min-width: 200px;
            overflow: hidden;
        `;

        // Get blocks from registry
        const blocks = BlockRegistry.getAllBlocks();

        // Create menu items
        blocks.forEach((block, index) => {
            const menuItem = document.createElement('div');
            menuItem.className = 'bmark-menu-item';
            menuItem.style.cssText = `
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                cursor: pointer;
                transition: background 0.2s;
                color: #ffffff;
                font-size: 14px;
                ${index < blocks.length - 1 ? 'border-bottom: 1px solid #333333;' : ''}
            `;
            menuItem.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; width: 20px; height: 20px;">
                    ${block.icon}
                </div>
                <span>${block.name}</span>
            `;

            // Hover effect
            menuItem.onmouseover = () => {
                menuItem.style.background = '#333333';
            };
            menuItem.onmouseout = () => {
                menuItem.style.background = 'transparent';
            };

            // Click handler
            menuItem.addEventListener('click', () => {
                this.addBlock(block.type, block.defaultData);
                this.toggleMenu();
            });

            dropdownMenu.appendChild(menuItem);
        });

        // Toggle menu on plus button click
        plusButton.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMenu();
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!toolbar.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Append elements
        dropdownContainer.appendChild(arrow);
        dropdownContainer.appendChild(dropdownMenu);
        toolbar.appendChild(plusButton);
        toolbar.appendChild(dropdownContainer);

        // Append toolbar to toolbar container
        this.toolbarContainer.appendChild(toolbar);

        // Store references
        this.plusButton = plusButton;
        this.dropdownContainer = dropdownContainer;
        this.dropdownMenu = dropdownMenu;
    }

    /**
     * Toggles the dropdown menu visibility
     */
    toggleMenu() {
        if (this.isMenuOpen) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

    /**
     * Opens the dropdown menu
     */
    openMenu() {
        this.dropdownContainer.style.display = 'block';
        this.isMenuOpen = true;
        this.plusButton.style.background = '#f1f5f9';
        this.plusButton.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    }

    /**
     * Closes the dropdown menu
     */
    closeMenu() {
        this.dropdownContainer.style.display = 'none';
        this.isMenuOpen = false;
        this.plusButton.style.background = 'white';
        this.plusButton.style.boxShadow = 'none';
    }
}
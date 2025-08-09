import { BlockRegistry } from './blocks/index.js';
import { Paragraph } from './blocks/paragraph.js';
import { List } from './blocks/list.js';
import { Table } from './blocks/table.js';
import { YouTube } from './blocks/youtube.js';
import { Image } from './blocks/image.js';

export default class View {
    /**
     * @param {HTMLElement | string} holder 
     * @param {Object} options - Additional options for the view
     * @param {Function} options.uploadFunction - Function to handle image uploads
     * @param {boolean} options.readOnly - Whether the editor is read-only
     * @param {Object} options.styles - Custom styling options
     */
    constructor(holder, options = {}) {
        this.holder = typeof holder === "string" ? document.querySelector(holder) : holder;
        this.isMenuOpen = false;
        this.blocks = [];
        this.uploadFunction = options.uploadFunction || null;
        this.readOnly = options.readOnly || false;
        this.styles = options.styles || {};
        this.tools = {
            paragraph: Paragraph,
            list: List,
            table: Table,
            youtube: YouTube,
            image: Image
        };
        this.setupEditorStructure();
        if (!this.readOnly) {
            this.renderToolbar();
        }
    }

    /**
     * Sets up the editor structure with toolbar and content area
     */
    setupEditorStructure() {
        // Add editor class to holder
        this.holder.classList.add('bmark-editor');

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
     * Add a new block to the editor
     * @param {string} type - The block type
     * @param {Object} data - The block data
     * @param {number} afterIndex - Insert after this index (null for end)
     */
    addBlock(type, data = {}, afterIndex = null) {
        // Don't add blocks in read-only mode
        if (this.readOnly) {
            return null;
        }

        const Tool = this.tools[type];
        if (!Tool) {
            console.warn(`Unknown block type: ${type}`);
            return null;
        }

        let blockInstance;

        // Prepare constructor options
        const constructorOptions = {
            data,
            readOnly: this.readOnly,
            onEnter: () => {
                const index = this.blocks.findIndex(b => b.instance === blockInstance);
                this.addBlock(type, {}, index);
            },
            onBackspace: () => {
                const index = this.blocks.findIndex(b => b.instance === blockInstance);
                this.removeBlock(index);
            }
        };

        // Add upload function for Image blocks
        if (type === 'image') {
            constructorOptions.uploadFunction = this.uploadFunction;
        }

        blockInstance = new Tool(constructorOptions);

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
        // Don't remove blocks in read-only mode
        if (this.readOnly) {
            return;
        }

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

        // Create plus button
        const plusButton = document.createElement('button');
        plusButton.type = 'button';
        plusButton.className = 'bmark-plus-button';
        plusButton.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M10 3v14M3 10h14" stroke="#334155" stroke-width="2" stroke-linecap="round"/>
            </svg>
        `;
        plusButton.title = 'Add Block';

        // Create dropdown menu container
        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'bmark-dropdown-container';

        // Create pointing arrow
        const arrow = document.createElement('div');
        arrow.style.cssText = `
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-bottom: 8px solid #1e293b;
            margin-left: 12px;
            margin-bottom: -1px;
        `;

        // Create dropdown menu
        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = 'bmark-dropdown-menu';

        // Get blocks from registry
        const blocks = BlockRegistry.getAllBlocks();

        // Create menu items
        blocks.forEach((block, index) => {
            const menuItem = document.createElement('div');
            menuItem.className = 'bmark-menu-item';
            menuItem.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; width: 20px; height: 20px;">
                    ${block.icon}
                </div>
                <span>${block.name}</span>
            `;

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
        // Position dropdown relative to the plus button
        this.dropdownContainer.style.left = '8px';
        this.dropdownContainer.style.top = '100%';

        this.dropdownContainer.style.display = 'block';
        this.isMenuOpen = true;
        this.plusButton.classList.add('active');
    }

    /**
     * Closes the dropdown menu
     */
    closeMenu() {
        this.dropdownContainer.style.display = 'none';
        this.isMenuOpen = false;
        this.plusButton.classList.remove('active');
    }

    /**
     * Set read-only mode
     * @param {boolean} readOnly - Whether to make it read-only
     */
    setReadOnly(readOnly) {
        this.readOnly = readOnly;

        if (readOnly) {
            // Add read-only class to editor
            this.holder.classList.add('bmark-readonly');
        } else {
            // Remove read-only class from editor
            this.holder.classList.remove('bmark-readonly');
        }

        // Update all blocks
        this.blocks.forEach(block => {
            if (block.instance && block.instance.setReadOnly) {
                block.instance.setReadOnly(readOnly);
            }
        });
    }

    /**
     * Get HTML content
     * @returns {string} HTML string
     */
    getHTML() {
        return this.contentArea.innerHTML;
    }

    /**
     * Destroy the view and clean up
     */
    destroy() {
        // Remove event listeners
        if (this.plusButton) {
            this.plusButton.removeEventListener('click', this.toggleMenu);
        }

        // Clear blocks
        this.blocks.forEach(block => {
            if (block.instance && block.instance.destroy) {
                block.instance.destroy();
            }
        });

        // Clear DOM
        if (this.holder && this.holder.innerHTML) {
            this.holder.innerHTML = '';
        }

        this.blocks = [];
        this.isMenuOpen = false;
    }
}
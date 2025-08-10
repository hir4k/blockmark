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
     * @param {boolean} options.required - Whether the editor is required
     */
    constructor(holder, options = {}) {
        this.holder = typeof holder === "string" ? document.querySelector(holder) : holder;
        this.isMenuOpen = false;
        this.blocks = [];
        this.activeBlockIndex = -1; // Track the active block
        this.uploadFunction = options.uploadFunction || null;
        this.readOnly = options.readOnly || false;
        this.styles = options.styles || {};
        this.title = options.title || null; // Add title option
        this.required = options.required || false; // Add required option
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
        this.holder.setAttribute('data-required', this.required.toString());

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
                // Check if there's pending split data from the current paragraph
                const pendingData = blockInstance.getPendingSplitData ? blockInstance.getPendingSplitData() : null;
                this.addBlock(type, pendingData || {}, index);
            },
            onBackspace: () => {
                // Find the block by its instance reference
                const index = this.blocks.findIndex(b => b.instance === blockInstance);
                if (index !== -1) {
                    // Check if there's pending merge data from the current paragraph
                    const pendingMergeData = blockInstance.getPendingMergeData ? blockInstance.getPendingMergeData() : null;
                    this.removeBlock(index, pendingMergeData);
                }
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

        // Add event listeners to track active block
        blockElement.addEventListener('click', () => {
            const blockIndex = this.blocks.findIndex(b => b.instance === blockInstance);
            if (blockIndex !== -1) {
                this.setActiveBlock(blockIndex);
            }
        });

        blockElement.addEventListener('focusin', () => {
            const blockIndex = this.blocks.findIndex(b => b.instance === blockInstance);
            if (blockIndex !== -1) {
                this.setActiveBlock(blockIndex);
            }
        });

        const insertAt = afterIndex != null ? afterIndex + 1 : this.blocks.length;

        if (insertAt >= this.blocks.length) {
            this.contentArea.appendChild(blockElement);
        } else {
            this.contentArea.insertBefore(blockElement, this.contentArea.children[insertAt]);
        }

        this.blocks.splice(insertAt, 0, { type, instance: blockInstance });

        // Set focus and active block
        setTimeout(() => {
            blockInstance.element?.focus();
            this.setActiveBlock(insertAt);
        }, 0);

        return blockInstance;
    }

    /**
     * Remove a block from the editor
     * @param {number} index - The index of the block to remove
     * @param {Object} mergeData - Data to merge with the previous paragraph (optional)
     */
    removeBlock(index, mergeData = null) {
        // Don't remove blocks in read-only mode
        if (this.readOnly) {
            return;
        }

        // Allow removing even the last block completely
        if (this.blocks.length <= 1) {
            // Remove the current block
            const { instance } = this.blocks[index];
            const element = instance.element;
            if (element && element.remove) {
                element.remove();
            }
            this.blocks.splice(index, 1);

            // Clear active block since no blocks remain
            this.setActiveBlock(-1);
            return;
        }

        const { instance } = this.blocks[index];
        const element = instance.element;
        if (element && element.remove) {
            element.remove();
        }

        // Handle merge data if provided
        if (mergeData && index > 0) {
            const previousBlock = this.blocks[index - 1];
            if (previousBlock && previousBlock.type === 'paragraph') {
                // Merge the text with the previous paragraph
                const previousText = previousBlock.instance.data || [];
                const mergeText = mergeData.text || [];

                // Combine the text arrays
                const combinedText = [...previousText, ...mergeText];
                previousBlock.instance.data = combinedText;

                // Update the previous paragraph's display
                previousBlock.instance.element.innerHTML = previousBlock.instance._renderText();

                // Focus the previous block and place caret at the end
                previousBlock.instance.element.focus();
                this.placeCaretAtEnd(previousBlock.instance.element);
                this.setActiveBlock(index - 1);
            } else {
                // Previous block is not a paragraph, just focus it
                if (previousBlock?.instance?.element?.focus) {
                    previousBlock.instance.element.focus();
                    this.placeCaretAtEnd(previousBlock.instance.element);
                    this.setActiveBlock(index - 1);
                }
            }
        } else {
            // No merge data, handle normally
            // Update active block index
            if (this.activeBlockIndex >= index) {
                this.activeBlockIndex = Math.max(0, this.activeBlockIndex - 1);
            }

            // Focus previous block and place caret at end
            const previous = this.blocks[index - 1];
            if (previous?.instance?.element?.focus) {
                previous.instance.element.focus();
                this.placeCaretAtEnd(previous.instance.element);
                this.setActiveBlock(index - 1);
            } else if (this.blocks.length > 0) {
                // Focus the first block if no previous block
                const firstBlock = this.blocks[0];
                if (firstBlock?.instance?.element?.focus) {
                    firstBlock.instance.element.focus();
                    this.setActiveBlock(0);
                }
            } else {
                // No blocks left, clear active block
                this.setActiveBlock(-1);
            }
        }

        this.blocks.splice(index, 1);
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

        // Set the first block as active if there are blocks
        if (this.blocks.length > 0) {
            this.setActiveBlock(0);
        }
    }

    /**
     * Renders a toolbar with a plus button that shows a dropdown menu of available blocks.
     */
    renderToolbar() {
        // Create toolbar container
        const toolbar = document.createElement('div');
        toolbar.className = 'bmark-toolbar';

        // Create title section
        if (this.title) {
            const titleSection = document.createElement('div');
            titleSection.className = 'bmark-toolbar-title-section';

            const titleElement = document.createElement('div');
            titleElement.className = 'bmark-toolbar-title';
            titleElement.textContent = this.title;
            titleSection.appendChild(titleElement);

            toolbar.appendChild(titleSection);
        }

        // Create button container
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'bmark-toolbar-button-container';

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

        // Create remove button
        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'bmark-remove-button';
        removeButton.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M6 6l8 8M14 6l-8 8" stroke="#dc2626" stroke-width="2" stroke-linecap="round"/>
            </svg>
        `;
        removeButton.title = 'Remove Active Block';

        // Remove button click handler
        removeButton.addEventListener('click', () => {
            if (this.activeBlockIndex !== -1 && this.blocks.length > 0) {
                this.removeBlock(this.activeBlockIndex);
            }
        });

        // Create dropdown menu container
        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'bmark-dropdown-container';

        // Create pointing arrow
        const arrow = document.createElement('div');
        arrow.className = 'bmark-dropdown-arrow';

        // Create dropdown menu
        const dropdownMenu = document.createElement('div');
        dropdownMenu.className = 'bmark-dropdown-menu';

        // Get blocks from registry
        const blocks = BlockRegistry.getAllBlocks();

        // Create menu items
        blocks.forEach(block => {
            const menuItem = document.createElement('div');
            menuItem.className = 'bmark-menu-item';
            menuItem.innerHTML = `
                <span>${block.icon}</span>
                <span>${block.name}</span>
            `;
            menuItem.addEventListener('click', () => {
                this.addBlock(block.type, block.defaultData);
                this.closeMenu();
            });
            dropdownMenu.appendChild(menuItem);
        });

        // Assemble dropdown
        dropdownContainer.appendChild(arrow);
        dropdownContainer.appendChild(dropdownMenu);

        // Plus button click handler
        plusButton.addEventListener('click', () => {
            this.toggleMenu();
        });

        // Add elements to toolbar
        buttonContainer.appendChild(plusButton);
        buttonContainer.appendChild(removeButton);
        toolbar.appendChild(buttonContainer);

        // Add dropdown to toolbar
        toolbar.appendChild(dropdownContainer);

        // Add toolbar to container
        this.toolbarContainer.appendChild(toolbar);

        // Store references
        this.plusButton = plusButton;
        this.removeButton = removeButton;
        this.dropdownContainer = dropdownContainer;
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
        if (this.dropdownContainer) {
            this.dropdownContainer.style.display = 'block';
            this.plusButton.classList.add('active');
        }
    }

    /**
     * Closes the dropdown menu
     */
    closeMenu() {
        if (this.dropdownContainer) {
            this.dropdownContainer.style.display = 'none';
            this.plusButton.classList.remove('active');
        }
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
     * Set the active block index
     * @param {number} index - The index of the active block (-1 for none)
     */
    setActiveBlock(index) {
        this.activeBlockIndex = index;
        this.updateRemoveButtonState();
    }

    /**
     * Update the remove button state based on active block
     */
    updateRemoveButtonState() {
        if (this.removeButton) {
            if (this.activeBlockIndex !== -1 && this.blocks.length > 0) {
                this.removeButton.classList.add('active');
                this.removeButton.classList.remove('inactive');
            } else {
                this.removeButton.classList.remove('active');
                this.removeButton.classList.add('inactive');
            }
        }
    }

    /**
 * Update the toolbar title
 * @param {string} title - New title text
 */
    updateToolbarTitle(title) {
        this.title = title;

        // Re-render the toolbar to show the new text
        if (this.toolbarContainer) {
            this.toolbarContainer.innerHTML = '';
            this.renderToolbar();
        }
    }

    /**
     * Check if the editor has any content by examining the DOM
     * @returns {boolean} True if the editor has content
     */
    hasContent() {
        // Check if there's any text content in the editor
        const textContent = this.contentArea.textContent.trim();
        if (textContent.length > 0) {
            return true;
        }

        // Check if there are any images or videos
        const images = this.contentArea.querySelectorAll('img');
        const videos = this.contentArea.querySelectorAll('iframe');

        return images.length > 0 || videos.length > 0;
    }

    /**
     * Validate that the editor is not empty (when required)
     * @returns {boolean} True if the editor is valid
     */
    validateEditor() {
        // If editor is not required, always return true
        if (!this.required) {
            return true;
        }

        // If required, check if editor has any content
        return this.hasContent();
    }

    /**
     * Get validation error message if editor is empty when required
     * @returns {string|null} Error message or null if valid
     */
    getValidationError() {
        if (!this.required) return null;
        if (this.hasContent()) return null;
        return 'Editor cannot be empty';
    }

    /**
     * Set whether the editor is required
     * @param {boolean} required - Whether the editor should be required
     */
    setRequired(required) {
        this.required = required;
        this.holder.setAttribute('data-required', required.toString());
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
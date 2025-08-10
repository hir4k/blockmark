import Controller from "./controller";
import Model from "./model";
import View from "./view";
import "./scss/main.scss";

/**
 * BlockmarkEditor - A block-based rich text editor library
 * 
 * @example
 * // Basic usage
 * const editor = new BlockmarkEditor('#editor', {
 *   uploadFunction: async (file) => {
 *     // Your upload logic here
 *     return 'https://example.com/image.jpg';
 *   }
 * });
 * 
 * // Save content
 * const content = editor.save();
 * 
 * // Load content
 * editor.load(content);
 */
export class BlockmarkEditor {
    /**
     * Create a new BlockmarkEditor instance
     * @param {string|HTMLElement} container - CSS selector or DOM element
     * @param {Object} options - Configuration options
     * @param {Function} options.uploadFunction - Function to handle image uploads
     * @param {Object} options.blocks - Custom block configuration
     * @param {Object} options.styles - Custom styling options
     * @param {boolean} options.readOnly - Whether the editor is read-only
     * @param {boolean} options.required - Whether the editor is required
     */
    constructor(container, options = {}) {
        this.container = typeof container === "string" ? document.querySelector(container) : container;

        if (!this.container) {
            throw new Error('Container element not found');
        }

        this.options = {
            uploadFunction: null,
            blocks: {},
            styles: {},
            readOnly: false,
            required: false,
            ...options
        };

        this.model = new Model();
        this.view = new View(this.container, {
            uploadFunction: this.options.uploadFunction,
            readOnly: this.options.readOnly,
            required: this.options.required,
            ...this.options
        });

        this.controller = new Controller({
            model: this.model,
            view: this.view
        });

        // Store reference to self for cleanup
        this._instance = this;
    }

    /**
     * Save the editor content
     * @returns {Array} Array of block data
     * @throws {Error} If editor is required but empty
     */
    save() {
        return this.controller.save();
    }

    /**
     * Load content into the editor
     * @param {Array} data - Array of block data
     */
    load(data) {
        this.controller.load(data);
    }

    /**
     * Get the current content as HTML
     * @returns {string} HTML string
     */
    getHTML() {
        return this.view.getHTML();
    }

    /**
     * Set the editor to read-only mode
     * @param {boolean} readOnly - Whether to make it read-only
     */
    setReadOnly(readOnly) {
        this.options.readOnly = readOnly;
        this.view.setReadOnly(readOnly);
    }

    /**
     * Set whether the editor is required
     * @param {boolean} required - Whether the editor should be required
     */
    setRequired(required) {
        this.options.required = required;
        this.view.setRequired(required);
    }

    /**
     * Validate that the editor is not empty (when required)
     * @returns {boolean} True if the editor is valid
     */
    validate() {
        return this.controller.validate();
    }

    /**
     * Get validation error message if editor is empty when required
     * @returns {string|null} Error message or null if valid
     */
    getValidationError() {
        return this.controller.getValidationError();
    }

    /**
     * Update the upload function
     * @param {Function} uploadFunction - New upload function
     */
    setUploadFunction(uploadFunction) {
        this.options.uploadFunction = uploadFunction;
        this.view.uploadFunction = uploadFunction;
    }

    /**
     * Add a new block
     * @param {string} type - Block type
     * @param {Object} data - Block data
     * @param {number} afterIndex - Insert after this index
     */
    addBlock(type, data = {}, afterIndex = null) {
        this.view.addBlock(type, data, afterIndex);
    }

    /**
     * Remove a block
     * @param {number} index - Block index to remove
     */
    removeBlock(index) {
        this.view.removeBlock(index);
    }

    /**
     * Get all blocks data
     * @returns {Array} Array of block data
     */
    getBlocks() {
        return this.view.getBlocksData();
    }

    /**
     * Clear all content
     */
    clear() {
        this.load([]);
    }

    /**
     * Destroy the editor instance and clean up
     */
    destroy() {
        if (this.view && this.view.destroy) {
            this.view.destroy();
        }
        this.controller = null;
        this.model = null;
        this.view = null;
        this._instance = null;
    }
}

// Default export
export default BlockmarkEditor;

// Named exports for individual components
export { Controller, Model, View };

// Export block classes for advanced usage
export { BlockRegistry, Paragraph, List, Table, YouTube, Image } from './blocks/index.js';

// For UMD compatibility
if (typeof window !== 'undefined') {
    window.BlockmarkEditor = BlockmarkEditor;
}

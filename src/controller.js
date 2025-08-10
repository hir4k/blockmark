import Model from "./model";
import View from "./view";

export default class Controller {

    /**
     * Controller class that connects the Model and View.
     * Handles user interactions and updates the Model and View accordingly.
     *
     * @class
     * @param {Object} options - The options for the controller.
     * @param {Model} options.model - The model instance.
     * @param {View} options.view - The view instance.
     */
    constructor({ model, view }) {
        this.model = model;
        this.view = view;

        // Sync Model with View's initial state
        this.syncModelToView();
    }

    /**
     * Sync the Model with the current View state
     */
    syncModelToView() {
        const blocksData = this.view.getBlocksData();
        this.model.load(blocksData);
    }

    /**
     * Save the editor content in the JSON format specified in block.md
     * @returns {Array} Array of block data
     * @throws {Error} If editor is required but empty
     */
    save() {
        // Get current data from View and sync to Model
        this.syncModelToView();

        // Validate before saving if editor is required
        if (this.view.required && !this.view.hasContent()) {
            throw new Error('Editor cannot be empty');
        }

        return this.model.save();
    }

    /**
     * Load editor content from saved data
     * @param {Array} data - Array of block data in the format specified in block.md
     */
    load(data) {
        // Load data into Model first
        this.model.load(data);

        // Then load into View
        this.view.loadBlocks(data);
    }

    /**
     * Validate that the editor is not empty (when required)
     * @returns {boolean} True if the editor is valid
     */
    validate() {
        return this.view.validateEditor();
    }

    /**
     * Get validation error message if editor is empty when required
     * @returns {string|null} Error message or null if valid
     */
    getValidationError() {
        return this.view.getValidationError();
    }

    /**
     * Set whether the editor is required
     * @param {boolean} required - Whether the editor should be required
     */
    setRequired(required) {
        this.view.setRequired(required);
    }
}
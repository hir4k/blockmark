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
     */
    save() {
        // Get current data from View and sync to Model
        this.syncModelToView();
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
}
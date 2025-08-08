export default class Model {
    constructor() {
        this.blocks = [];
    }

    /**
     * Add a block to the data store
     * @param {string} type - The block type
     * @param {Object} data - The block data
     * @param {number} afterIndex - Insert after this index (null for end)
     */
    addBlock(type, data = {}, afterIndex = null) {
        const insertAt = afterIndex != null ? afterIndex + 1 : this.blocks.length;
        this.blocks.splice(insertAt, 0, { type, data });
    }

    /**
     * Remove a block from the data store
     * @param {number} index - The index of the block to remove
     */
    removeBlock(index) {
        if (this.blocks.length <= 1) return;
        this.blocks.splice(index, 1);
    }

    /**
     * Get all blocks
     * @returns {Array} Array of block objects
     */
    getBlocks() {
        return this.blocks;
    }

    /**
     * Get a specific block by index
     * @param {number} index - The block index
     * @returns {Object|null} Block object or null if not found
     */
    getBlock(index) {
        return this.blocks[index] || null;
    }

    /**
     * Get the number of blocks
     * @returns {number} Number of blocks
     */
    getBlockCount() {
        return this.blocks.length;
    }

    /**
     * Save all blocks and return data in the specified JSON format
     * @returns {Array} Array of block data in the format specified in block.md
     */
    save() {
        return this.blocks.map(({ type, data }) => {
            return { type, ...data };
        });
    }

    /**
     * Load blocks from saved data
     * @param {Array} data - Array of block data in the format specified in block.md
     */
    load(data) {
        this.blocks = [];
        data.forEach(blockData => {
            const { type, ...data } = blockData;
            this.addBlock(type, data);
        });
    }
}
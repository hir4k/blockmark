import { Paragraph } from './paragraph.js';
import { List } from './list.js';
import { Table } from './table.js';

/**
 * Centralized registry for all available blocks
 * This prevents typos and makes it easy to manage block definitions
 */
export class BlockRegistry {
    static blocks = {
        paragraph: {
            name: Paragraph.name,
            type: Paragraph.type,
            icon: Paragraph.icon,
            defaultData: Paragraph.defaultData
        },
        unorderedList: List.getUnorderedList(),
        orderedList: List.getOrderedList(),
        table: {
            name: Table.name,
            type: Table.type,
            icon: Table.icon,
            defaultData: Table.defaultData
        }
    };

    /**
     * Get all available blocks as an array
     * @returns {Array} Array of block definitions
     */
    static getAllBlocks() {
        return Object.values(this.blocks);
    }

    /**
     * Get a specific block by key
     * @param {string} key - The block key
     * @returns {Object|null} Block definition or null if not found
     */
    static getBlock(key) {
        return this.blocks[key] || null;
    }

    /**
     * Get block keys (useful for validation)
     * @returns {Array} Array of block keys
     */
    static getBlockKeys() {
        return Object.keys(this.blocks);
    }

    /**
     * Check if a block exists
     * @param {string} key - The block key
     * @returns {boolean} True if block exists
     */
    static hasBlock(key) {
        return key in this.blocks;
    }

    /**
     * Get block type by key
     * @param {string} key - The block key
     * @returns {string|null} Block type or null if not found
     */
    static getBlockType(key) {
        const block = this.getBlock(key);
        return block ? block.type : null;
    }
}

// Export individual blocks for direct access
export { Paragraph, List, Table }; 
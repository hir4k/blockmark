/**
 * Centralized registry for all available blocks
 * This prevents typos and makes it easy to manage block definitions
 */
export class BlockRegistry {
    static blocks = {
        paragraph: {
            name: 'Paragraph',
            type: 'paragraph',
            icon: `<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><rect x="3" y="4" width="14" height="2" rx="1" fill="#ffffff"/><rect x="3" y="8" width="10" height="2" rx="1" fill="#ffffff"/><rect x="3" y="12" width="7" height="2" rx="1" fill="#ffffff"/></svg>`,
            data: {
                text: []
            }
        },
        unorderedList: {
            name: 'Bullet List',
            type: 'list',
            icon: `<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><circle cx="6" cy="10" r="2" fill="#ffffff"/><rect x="10" y="9" width="7" height="2" rx="1" fill="#ffffff"/></svg>`,
            data: {
                ordered: false,
                items: []
            }
        },
        orderedList: {
            name: 'Numbered List',
            type: 'list',
            icon: `<svg width="16" height="16" viewBox="0 0 20 20" fill="none"><text x="4" y="12" font-size="8" fill="#ffffff">1.</text><rect x="10" y="9" width="7" height="2" rx="1" fill="#ffffff"/></svg>`,
            data: {
                ordered: true,
                items: []
            }
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
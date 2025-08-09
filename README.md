# Blockmark

A lightweight, block-based rich text editor library for modern web applications.

## Features

- 🧱 **Block-based editing** - Create content using different block types
- 📝 **Rich text support** - Paragraphs, lists, tables, images, and YouTube embeds
- 🎨 **Customizable** - Easy to style and configure
- 📱 **Responsive** - Works on desktop and mobile devices
- 🔒 **Read-only mode** - Display content without editing capabilities
- 💾 **Data persistence** - Save and load content in JSON format
- 🖼️ **Image upload** - Customizable image upload functionality
- 🎯 **Lightweight** - No heavy dependencies

## Installation

### NPM
```bash
npm install blockmark
```

### CDN
```html
<script src="https://unpkg.com/blockmark/dist/blockmark.umd.js"></script>
<link rel="stylesheet" href="https://unpkg.com/blockmark/dist/blockmark.css">
```

## Quick Start

### Basic Usage

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="https://unpkg.com/blockmark/dist/blockmark.css">
</head>
<body>
    <div id="editor"></div>
    
    <script src="https://unpkg.com/blockmark/dist/blockmark.umd.js"></script>
    <script>
        const editor = new Blockmark('#editor', {
            uploadFunction: async (file) => {
                // Your upload logic here
                return 'https://example.com/image.jpg';
            }
        });
    </script>
</body>
</html>
```

### ES6 Module

```javascript
import BlockmarkEditor from 'blockmark';
import 'blockmark/dist/blockmark.css';

const editor = new BlockmarkEditor('#editor', {
    uploadFunction: async (file) => {
        // Your upload logic here
        return 'https://example.com/image.jpg';
    }
});
```

## API Reference

### Constructor

```javascript
new BlockmarkEditor(container, options)
```

#### Parameters

- `container` (string|HTMLElement) - CSS selector or DOM element
- `options` (Object) - Configuration options
  - `uploadFunction` (Function) - Function to handle image uploads
  - `readOnly` (boolean) - Whether the editor is read-only (default: false)
  - `styles` (Object) - Custom styling options

### Methods

#### `save()`
Save the editor content as JSON data.

```javascript
const content = editor.save();
// Returns: [{ type: 'paragraph', content: 'Hello world' }, ...]
```

#### `load(data)`
Load content into the editor from JSON data.

```javascript
editor.load([
    { type: 'paragraph', content: 'Hello world' },
    { type: 'image', src: 'https://example.com/image.jpg' }
]);
```

#### `getHTML()`
Get the current content as HTML string.

```javascript
const html = editor.getHTML();
// Returns: '<p>Hello world</p><img src="...">'
```

#### `setReadOnly(readOnly)`
Set the editor to read-only mode.

```javascript
editor.setReadOnly(true);  // Make read-only
editor.setReadOnly(false); // Make editable
```

#### `setUploadFunction(uploadFunction)`
Update the image upload function.

```javascript
editor.setUploadFunction(async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch('/upload', {
        method: 'POST',
        body: formData
    });
    
    const result = await response.json();
    return result.url;
});
```

#### `addBlock(type, data, afterIndex)`
Add a new block to the editor.

```javascript
editor.addBlock('paragraph', { content: 'New paragraph' });
editor.addBlock('image', { src: 'https://example.com/image.jpg' }, 0);
```

#### `removeBlock(index)`
Remove a block from the editor.

```javascript
editor.removeBlock(0); // Remove first block
```

#### `getBlocks()`
Get all blocks data.

```javascript
const blocks = editor.getBlocks();
```

#### `clear()`
Clear all content from the editor.

```javascript
editor.clear();
```

#### `destroy()`
Destroy the editor instance and clean up.

```javascript
editor.destroy();
```

## Block Types

### Paragraph
Basic text block with rich text formatting.

```javascript
{ type: 'paragraph', content: 'Your text here' }
```

### List
Ordered or unordered lists.

```javascript
{ type: 'unorderedList', items: ['Item 1', 'Item 2'] }
{ type: 'orderedList', items: ['Item 1', 'Item 2'] }
```

### Table
Data tables with customizable rows and columns.

```javascript
{ 
    type: 'table', 
    headers: ['Name', 'Age'], 
    rows: [['John', '25'], ['Jane', '30']] 
}
```

### Image
Image blocks with upload support.

```javascript
{ type: 'image', src: 'https://example.com/image.jpg', alt: 'Description' }
```

### YouTube
YouTube video embeds.

```javascript
{ type: 'youtube', videoId: 'dQw4w9WgXcQ' }
```

## Configuration Examples

### Custom Image Upload

```javascript
const editor = new BlockmarkEditor('#editor', {
    uploadFunction: async (file) => {
        // Upload to your server
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        const result = await response.json();
        return result.imageUrl;
    }
});
```

### Read-only Display

```javascript
const editor = new BlockmarkEditor('#editor', {
    readOnly: true
});

// Load content for display
editor.load(savedContent);
```

### Custom Styling

```css
/* Override default styles */
.bmark-editor {
    border: 2px solid #3b82f6;
    border-radius: 12px;
}

.bmark-toolbar-container {
    background: #1e40af;
    color: white;
}

.bmark-content-area {
    font-family: 'Georgia', serif;
    line-height: 1.8;
}
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## License

ISC

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

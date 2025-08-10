# Blockmark

A lightweight, block-based rich text editor library for modern web applications.

## Features

- 🧱 **Block-based editing** - Create content using different block types
- 📝 **Rich text support** - Paragraphs, lists, tables, images, and YouTube embeds
- ✅ **Editor validation** - Required editor validation with error handling
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
            },
            required: true // Make the editor required
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
    },
    required: true // Make the editor required
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
  - `required` (boolean) - Whether the editor is required (default: false)
  - `styles` (Object) - Custom styling options

### Methods

#### `save()`
Save the editor content as JSON data. Throws an error if editor is required but empty.

```javascript
try {
    const content = editor.save();
    // Returns: [{ type: 'paragraph', text: [{ text: 'Hello world' }] }, ...]
} catch (error) {
    console.error('Save failed:', error.message);
}
```

#### `load(data)`
Load content into the editor from JSON data.

```javascript
editor.load([
    { type: 'paragraph', text: [{ text: 'Hello world' }] },
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

#### `setRequired(required)`
Set whether the editor is required.

```javascript
editor.setRequired(true);  // Make required
editor.setRequired(false); // Make optional
```

#### `validate()`
Check if the editor is valid (has content when required).

```javascript
const isValid = editor.validate();
// Returns: true if editor is valid, false otherwise
```

#### `getValidationError()`
Get validation error message if editor is invalid.

```javascript
const error = editor.getValidationError();
// Returns: error message string or null if valid
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
editor.addBlock('paragraph', { text: [{ text: 'New paragraph' }] });
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
{ 
    type: 'paragraph', 
    text: [{ text: 'Your text here' }]
}
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

## Editor Validation

Blockmark supports editor-level validation. When the editor is marked as required, it must have at least some content before saving.

### Setting Editor as Required

```javascript
// When creating the editor
const editor = new BlockmarkEditor('#editor', {
    required: true
});

// Or programmatically
editor.setRequired(true);
```

### Validation Example

```javascript
// Check if editor is valid
if (editor.validate()) {
    console.log('Editor is valid!');
    const data = editor.save();
    // Submit data to server
} else {
    const error = editor.getValidationError();
    console.log('Validation error:', error);
    // Show error to user
}
```

### Save with Validation

```javascript
try {
    const data = editor.save();
    console.log('Save successful:', data);
} catch (error) {
    console.error('Save failed:', error.message);
    // Handle validation error
}
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
    },
    required: true
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

### Form with Validation

```javascript
const editor = new BlockmarkEditor('#editor', {
    required: true
});

// Handle form submission
document.getElementById('submit-btn').addEventListener('click', () => {
    try {
        const formData = editor.save();
        // Submit to server
        console.log('Form is valid:', formData);
    } catch (error) {
        alert('Please add some content to the editor');
        console.log('Validation error:', error.message);
    }
});
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

/* Custom validation styles */
.bmark-editor[data-required="true"]:empty::after {
    content: 'This field is required';
    color: #dc2626;
    font-weight: 500;
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

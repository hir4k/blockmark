# ✍️ Custom Modular Block Editor Format (Verbose)

This document defines the structure of the data format used by our custom block-based rich text editor. The format is **modular**, **readable**, and **extensible**, making it easy to add/remove features like tables, embeds, etc.

---

## 📦 Block-Based Structure

Each document is an array of **blocks**, where every block represents a distinct piece of content:

```json
[
  {
    "type": "paragraph",
    "text": [
      { "text": "Hello " },
      { "text": "World", "bold": true }
    ]
  },
  {
    "type": "image",
    "src": "https://example.com/image.jpg",
    "alt": "An image"
  }
]
```

---

## 🧱 Supported Blocks

### 1. Paragraph

```json
{
  "type": "paragraph",
  "text": [
    { "text": "Normal text " },
    { "text": "bold text", "bold": true },
    { "text": " and italic", "italic": true }
  ]
}
```

---

### 2. Heading

```json
{
  "type": "heading",
  "level": 2,
  "text": [
    { "text": "Welcome " },
    { "text": "Everyone", "underline": true }
  ]
}
```

* `level`: integer (1–6) to define heading level (`<h1>` to `<h6>`)

---

### 3. List (Ordered / Unordered)

#### Ordered List

```json
{
  "type": "list",
  "ordered": true,
  "items": [
    [ { "text": "Step one" } ],
    [ { "text": "Step two", "bold": true } ]
  ]
}
```

#### Unordered List

```json
{
  "type": "list",
  "ordered": false,
  "items": [
    [ { "text": "Apple" } ],
    [ { "text": "Banana", "italic": true } ]
  ]
}
```

---

### 4. Table

```json
{
  "type": "table",
  "rows": [
    [ [ { "text": "Name", "bold": true } ], [ { "text": "Age", "bold": true } ] ],
    [ [ { "text": "Alice" } ], [ { "text": "24" } ] ],
    [ [ { "text": "Bob" } ] ]
  ]
}
```

* Each `row` is an array of **cells**
* Each `cell` is an array of **text segments**
* Supports uneven row lengths

---

### 5. Image

```json
{
  "type": "image",
  "src": "https://example.com/image.jpg",
  "alt": "An example image"
}
```

---

### 6. YouTube Embed

```json
{
  "type": "youtube",
  "url": "https://www.youtube.com/watch?v=abcd1234"
}
```

---

## ✏️ Text Segment Format

For blocks like `paragraph`, `heading`, `list`, and `table`, text content is made of **segments**:

```json
{ "text": "Sample", "bold": true, "italic": true }
```

Supported inline styles:

* `bold`: true
* `italic`: true
* `underline`: true
* (Easily extendable with `strikethrough`, `color`, etc.)

---

## ⚙️ Extensibility

* To add a new block: define a new `"type"` and its corresponding structure
* To remove features (like table support): simply disable that plugin; other blocks still work
* All formatting is declarative and JSON-based

---

## 🧪 Edge Cases

* **Empty paragraph**:

  ```json
  { "type": "paragraph", "text": [] }
  ```
* **Heading with no text**:

  ```json
  { "type": "heading", "level": 2, "text": [] }
  ```
* **Table row with fewer cells**: supported (e.g., ragged rows)
* **Unknown block type**: should be ignored or rendered as a fallback by viewer

---

## ✅ Benefits

* Human-readable, easy to debug
* Fully modular (plugin-friendly)
* Works well with collaborative editing and delta-style updates
* Flutter, Web, and Server-compatible


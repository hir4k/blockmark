import Renderer from "./renderer"

class Editor {
    constructor(editorElement) {
        this.editorElement = editorElement
        this.blocks = [
            {
                type: "paragraph",
                text: [
                    { text: "Hello " },
                    { text: "World", bold: true }
                ]
            },
            {
                type: "list",
                ordered: false,
                items: [
                    [{ text: "Step one" }],
                    [{ text: "This is" }, { text: " Step two", "bold": true }]
                ]
            },
            {
                "type": "image",
                "src": "https://picsum.photos/id/237/200/300",
                "alt": "An example image"
            },
            {
                "type": "table",
                "rows": [
                    [[{ "text": "Name", "bold": true }], [{ "text": "Age", "bold": true }]],
                    [[{ "text": "Alice" }], [{ "text": "24" }]],
                    [[{ "text": "Bob" }]]
                ]
            }
        ]

        this.render()
    }

    render() {
        this.editorElement.innerHTML = ""
        this.blocks.forEach(block => {
            let el;

            if (block.type == "paragraph") {
                el = Renderer.paragraph(block)
            }

            if (block.type == "list") {
                el = Renderer.list(block)
            }

            if (block.type == "image") {
                el = Renderer.image(block);
            }

            if (block.type == "table") {
                el = Renderer.table(block);
            }

            this.editorElement.appendChild(el)
        })
    }
}

new Editor(
    document.getElementById("editor")
);
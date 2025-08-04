const Paragraph = {
    render: (block) => {
        const el = document.createElement("div")
        el.dataset.id = crypto.randomUUID()
        el.contentEditable = true

        block.text.forEach(t => {
            const span = document.createElement("span")
            span.appendChild(document.createTextNode(t.text))
            if (t.bold) span.classList.add("bold")
            el.appendChild(span)
        })

        return el;
    },
}


const List = {
    render: (block) => {
        const wrapper = document.createElement(block.ordered ? "ol" : "ul")

        block.items.forEach(item => {
            const li = document.createElement("li")
            li.dataset.id = crypto.randomUUID()
            li.contentEditable = true

            item.forEach(t => {
                const span = document.createElement("span")
                span.appendChild(document.createTextNode(t.text))
                if (t.bold) span.classList.add("bold")
                li.appendChild(span)
            })

            wrapper.appendChild(li)
        })

        return wrapper;
    },
}

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
        ]

        this.render()
    }

    render() {
        this.editorElement.innerHTML = ""
        this.blocks.forEach(block => {
            let el;

            if (block.type == "paragraph") {
                el = Paragraph.render(block)
            }

            if (block.type == "list") {
                el = List.render(block)
            }

            this.editorElement.appendChild(el)
        })
    }
}

new Editor(
    document.getElementById("editor")
);
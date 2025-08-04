export default Renderer = {
    paragraph: (block) => {
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
    list: (block) => {
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
    image: (block) => {
        const img = document.createElement("img");
        img.src = block.src;
        img.alt = block.alt || "";
        img.dataset.id = crypto.randomUUID();
        return img;
    },
    table: (block) => {
        const table = document.createElement("table");
        block.rows.forEach(row => {
            const tr = document.createElement("tr");
            row.forEach(cell => {
                // If this is the first row, treat as header
                const isHeader = block.rows.indexOf(row) === 0;
                const cellEl = document.createElement(isHeader ? "th" : "td");
                cellEl.dataset.id = crypto.randomUUID();
                cellEl.contentEditable = true;

                cell.forEach(t => {
                    const span = document.createElement("span");
                    span.appendChild(document.createTextNode(t.text));
                    if (t.bold) span.classList.add("bold");
                    cellEl.appendChild(span);
                });

                tr.appendChild(cellEl);
            });
            table.appendChild(tr);
        });

        return table;
    },
}
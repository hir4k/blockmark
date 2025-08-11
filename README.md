# Blockmark

A lightweight, block-based rich text editor library for modern web applications.


```js
<script src="bm.min.js"></script>
<script>
    const editor = new BlockMark("#editor", {
        title: "My Document",
        required: true,
        uploadFunction: async (file) => {
            const formData = new FormData();
            formData.append("image", file);
            const response = await fetch("http://localhost:3001/api/upload-image", {
                method: "POST",
                body: formData
            });
            const data = await response.json();
            return data.url;
        }
    });

    document.getElementById("save").addEventListener("click", () => {
        const data = editor.save();
        console.log(data);
    });
</script>
```

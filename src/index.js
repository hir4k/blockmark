import Controller from "./controller";
import Model from "./model";
import View from "./view";

// Default upload function (you can replace this with your own)
const defaultUploadFunction = async (file) => {
    // Example upload function - replace with your implementation
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch('http://localhost:3001/api/upload-image', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.url || result.imageUrl || result.src;
};

// Create the editor instance
const controller = new Controller({
    model: new Model(),
    view: new View("#editor", {
        uploadFunction: defaultUploadFunction,
        title: "My Document" // Add a title to the toolbar
    }),
});

// Expose the controller globally for save/load functionality
window.blockmarkEditor = controller;

// Expose a function to update upload function
window.setImageUploadFunction = (uploadFunction) => {
    controller.view.uploadFunction = uploadFunction;
};

// Expose a function to update toolbar title
window.updateToolbarTitle = (title) => {
    controller.view.updateToolbarTitle(title);
};
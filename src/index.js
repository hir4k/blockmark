import Controller from "./controller";
import Model from "./model";
import View from "./view";

// Create the editor instance
const controller = new Controller({
    model: new Model(),
    view: new View("#editor"),
});

// Expose the controller globally for save/load functionality
window.blockmarkEditor = controller;
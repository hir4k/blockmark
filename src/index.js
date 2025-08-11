import Controller from "./controller";
import Model from "./model";
import View from "./view";
import "./styles.css";


export default class BlockMark {
    constructor(elementId, options = {}) {
        this.elementId = elementId;
        this.controller = new Controller({
            model: new Model(),
            view: new View(this.elementId, {
                uploadFunction: options.uploadFunction,
                title: options.title,
                required: options.required,
            }),
        });
    }

    save() {
        return this.controller.save();
    }

    load(data) {
        return this.controller.load(data);
    }

    setReadOnly(readOnly) {
        return this.controller.setReadOnly(readOnly);
    }
}
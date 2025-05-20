"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OnReturn = void 0;
class OnReturn extends Error {
    value;
    type;
    explicit = false;
    constructor(value, type, explicit = false) {
        super();
        this.value = value;
        this.type = type;
        this.explicit = explicit;
    }
}
exports.OnReturn = OnReturn;

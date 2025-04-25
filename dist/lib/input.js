"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
class Input {
    api;
    constructor(api = "readline-sync") {
        this.api = api;
    }
    get(message = "") {
        if (this.api === "readline-sync") {
            const readlineSync = require("readline-sync");
            return readlineSync.question(message);
        }
        else {
            // @ts-ignore
            const prompt = require("syncprompt");
            return prompt(message);
        }
    }
}
exports.Input = Input;

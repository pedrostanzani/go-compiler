"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Debug = void 0;
class Debug {
    static debug = false;
    static log(...args) {
        if (Debug.debug) {
            console.log(...args);
        }
    }
}
exports.Debug = Debug;

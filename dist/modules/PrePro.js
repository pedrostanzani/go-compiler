"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrePro = void 0;
class PrePro {
    static filter(sourceCode) {
        return sourceCode.replace(/\/\/.*$/gm, '');
    }
}
exports.PrePro = PrePro;

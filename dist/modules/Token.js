"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Token = void 0;
class Token {
    type;
    value;
    constructor({ type, value = null, }) {
        this.type = type;
        this.value = value;
    }
    getType() {
        return this.type;
    }
    getNumericValue() {
        if (typeof this.value === "number") {
            return this.value;
        }
        return 0;
    }
    getStringValue() {
        if (typeof this.value === "string") {
            return this.value;
        }
        return "";
    }
    getBooleanValue() {
        if (typeof this.value === "boolean") {
            return this.value;
        }
        return false;
    }
    getValue() {
        return this.value;
    }
    getRepr() {
        return JSON.stringify({
            type: this.type,
            value: this.value,
        });
    }
}
exports.Token = Token;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntVal = exports.UnOp = exports.BinOp = void 0;
const enums_1 = require("../lib/enums");
class BinOp {
    value;
    children;
    constructor({ value, children, }) {
        this.value = value;
        this.children = children;
    }
    evaluate() {
        switch (this.value) {
            case enums_1.TokenType.PLUS:
                return this.children[0].evaluate() + this.children[1].evaluate();
            case enums_1.TokenType.MINUS:
                return this.children[0].evaluate() - this.children[1].evaluate();
            case enums_1.TokenType.DIVIDE:
                return Math.floor(this.children[0].evaluate() / this.children[1].evaluate());
            case enums_1.TokenType.X:
                return this.children[0].evaluate() * this.children[1].evaluate();
            default:
                break;
        }
        return 0;
    }
}
exports.BinOp = BinOp;
class UnOp {
    value;
    children;
    constructor({ value, children, }) {
        this.value = value;
        this.children = children;
    }
    evaluate() {
        if (this.value === enums_1.TokenType.MINUS) {
            return -this.children[0].evaluate();
        }
        return this.children[0].evaluate();
    }
}
exports.UnOp = UnOp;
class IntVal {
    value;
    children;
    constructor({ value, children, }) {
        this.value = value;
        this.children = children;
    }
    evaluate() {
        return this.value;
    }
}
exports.IntVal = IntVal;

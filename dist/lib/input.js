"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.input = input;
// @ts-ignore
const syncprompt_1 = __importDefault(require("syncprompt"));
function input(message = "") {
    return (0, syncprompt_1.default)(message);
}

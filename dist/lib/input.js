"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.input = input;
const readline_sync_1 = __importDefault(require("readline-sync"));
function input(prompt = "") {
    return readline_sync_1.default.question(prompt);
}

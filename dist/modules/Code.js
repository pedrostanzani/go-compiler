"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.code = void 0;
const fs_1 = require("fs");
class Code {
    static _instance;
    instructions = [];
    constructor() { }
    static getInstance() {
        if (Code._instance) {
            return Code._instance;
        }
        const c = new Code();
        Code._instance = c;
        return c;
    }
    append(code) {
        this.instructions.push(code);
    }
    dump(filename) {
        // Header
        const header = `
section .data
    format_out: db "%d", 10, 0  ; formato do printf
    format_in:  db "%d", 0      ; formato do scanf
    scan_int:   dd 0            ; variável para scanf

section .text
    extern printf       ; usar printf (Linux)
    extern scanf        ; usar scanf (Linux)
    global _start       ; início do programa

_start:
    push ebp
    mov ebp, esp
`.trimStart();
        // Stored instructions
        const body = this.instructions.join("\n");
        // Footer
        const footer = `
mov esp, ebp          ; reestabelece a pilha
pop ebp
mov eax, 1
xor ebx, ebx
int 0x80
`.trimEnd();
        const content = [header, body, footer].join("\n");
        (0, fs_1.writeFileSync)(filename, content, "utf-8");
    }
}
exports.code = Code.getInstance();

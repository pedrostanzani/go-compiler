import { writeFileSync } from "fs";

class Code {
  private static _instance: Code;
  private instructions: Array<string> = [];

  private constructor() {}

  public static getInstance(): Code {
    if (Code._instance) {
      return Code._instance;
    }

    const c = new Code();
    Code._instance = c;
    return c;
  }

  append(code: string) {
    this.instructions.push(code);
  }

  dump(filename: string) {
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
    writeFileSync(filename, content, "utf-8");
  }
}

export const code = Code.getInstance();

import { isDigit } from "../lib/utils";
import { Token } from "./Token";

export class Tokenizer {
  private source: string;
  private position: number;
  private next: Token;

  constructor({ source, position }: { source: string; position: number }) {
    this.source = source;
    this.position = position;
    this.next = this.extractNextTokenFromSource();
  }

  getSource() {
    return this.source;
  }

  getPosition() {
    return this.position;
  }

  getNext() {
    return this.next;
  }

  skipWhitespace(): void {
    const char = this.source[this.position];
    if (char === " ") {
      this.position++;
      return this.skipWhitespace();
    }
  }

  extractNextTokenFromSource(): Token {
    if (this.position >= this.source.length) {
      return new Token({ type: "EOF", value: 0 });
    }

    // Skip whitespace characters
    this.skipWhitespace();

    const char = this.source[this.position];

    if (char === "+") {
      this.position++;
      return new Token({ type: "PLUS", value: 0 });
    }

    if (char === "-") {
      this.position++;
      return new Token({ type: "MINUS", value: 0 });
    }

    let tokenValue = "";
    for (let i = this.position; i < this.source.length; i++) {
      const char = this.source[i];
      if (isDigit(char)) {
        tokenValue += char;
        this.position++;
      } else break;
    }

    return new Token({ type: "INT", value: Number(tokenValue) });
  }

  selectNext() {
    this.next = this.extractNextTokenFromSource();
  }
}

import { Token } from "./Token";
import { isDigit, isWhitespace } from "../lib/utils";
import { CommonTokens } from "../lib/enums";

export class Tokenizer {
  private source: string;
  private position: number;
  private next: Token;

  constructor({ source, position }: { source: string; position: number }) {
    this.source = source;
    this.position = position;
    this.next = this.extractToken();
  }

  getNext() {
    return this.next;
  }

  private skipWhitespace(): void {
    const char = this.source[this.position];
    if (isWhitespace(char)) {
      this.position++;
      return this.skipWhitespace();
    }
  }

  private extractDigitSequence(): string {
    let tokenValue = "";
    for (let i = this.position; i < this.source.length; i++) {
      const char = this.source[i];
      if (isDigit(char)) {
        tokenValue += char;
        this.position++;
      } else break;
    }

    return tokenValue;
  }

  private extractToken(): Token {
    // Skip all whitespace tokens recursively
    this.skipWhitespace();

    // Detect if the next token is EOF
    if (this.position >= this.source.length) {
      return new Token({ type: "EOF", value: 0 });
    }

    // Detect common tokens
    const char = this.source[this.position];
    switch (char) {
      case CommonTokens.PLUS:
        this.position++;
        return new Token({ type: "PLUS", value: 0 });

      case CommonTokens.MINUS:
        this.position++;
        return new Token({ type: "MINUS", value: 0 });

      case CommonTokens.X:
        this.position++;
        return new Token({ type: "X", value: 0 });

      case CommonTokens.DIVIDE:
        this.position++;
        return new Token({ type: "DIVIDE", value: 0 });

      default:
        break;
    }

    if (isDigit(char)) {
      const digitSequence = this.extractDigitSequence();
      return new Token({ type: "INT", value: Number(digitSequence) });
    }

    throw new Error(`Unknown token ${char}`)
  }

  public selectNext() {
    this.next = this.extractToken();
  }

  public fetchAndSelectNext() {
    this.selectNext();
    return this.next;
  }
}

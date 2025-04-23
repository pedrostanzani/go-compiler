import { Token } from "./Token";
import {
  isAlpha,
  isDigit,
  isValidIdentifierChar,
  isWhitespace,
} from "../lib/utils";
import { TokenRepresentation, TokenType } from "../lib/enums";

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

  private extractIdentifierSequence(): string {
    let tokenValue = "";
    for (let i = this.position; i < this.source.length; i++) {
      const char = this.source[i];
      if (isValidIdentifierChar(char)) {
        tokenValue += char;
        this.position++;
      } else break;
    }

    return tokenValue;
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
      return new Token({ type: TokenType.EOF });
    }

    // Detect common tokens
    const char = this.source[this.position];
    let nextChar: string;

    switch (char) {
      case TokenRepresentation.PLUS:
        this.position++;
        return new Token({ type: TokenType.PLUS });

      case TokenRepresentation.MINUS:
        this.position++;
        return new Token({ type: TokenType.MINUS });

      case TokenRepresentation.X:
        this.position++;
        return new Token({ type: TokenType.X });

      case TokenRepresentation.DIVIDE:
        this.position++;
        return new Token({ type: TokenType.DIVIDE });

      case TokenRepresentation.OPEN_PAR:
        this.position++;
        return new Token({ type: TokenType.OPEN_PAR });

      case TokenRepresentation.CLOSE_PAR:
        this.position++;
        return new Token({ type: TokenType.CLOSE_PAR });

      case TokenRepresentation.OPEN_BRAC:
        this.position++;
        return new Token({ type: TokenType.OPEN_BRAC });

      case TokenRepresentation.CLOSE_BRAC:
        this.position++;
        return new Token({ type: TokenType.CLOSE_BRAC });

      case TokenRepresentation.NEW_LINE:
        this.position++;
        return new Token({ type: TokenType.NEW_LINE });

      case TokenRepresentation.NOT:
        this.position++;
        return new Token({ type: TokenType.NOT });

      case TokenRepresentation.GREATER_THAN:
        this.position++;
        return new Token({ type: TokenType.GREATER_THAN });

      case TokenRepresentation.LESS_THAN:
        this.position++;
        return new Token({ type: TokenType.LESS_THAN });

      // Compound tokens
      case TokenRepresentation.ASSIGNMENT:
        this.position++;
        nextChar = this.source[this.position];
        if (nextChar === "=") {
          this.position++;
          return new Token({ type: TokenType.EQUALS });
        } else {
          return new Token({ type: TokenType.ASSIGNMENT });
        }

      case TokenRepresentation.AND.charAt(0):
        this.position++;
        nextChar = this.source[this.position];
        if (nextChar === TokenRepresentation.AND.charAt(1)) {
          this.position++;
          return new Token({ type: TokenType.AND });
        } else {
          throw new Error(`Unknown token ${char}`);
        }

      case TokenRepresentation.OR.charAt(0):
        this.position++;
        nextChar = this.source[this.position];
        if (nextChar === TokenRepresentation.OR.charAt(1)) {
          this.position++;
          return new Token({ type: TokenType.OR });
        } else {
          throw new Error(`Unknown token ${char}`);
        }

      default:
        break;
    }

    if (isDigit(char)) {
      const digitSequence = this.extractDigitSequence();
      return new Token({ type: TokenType.INT, value: Number(digitSequence) });
    }

    if (isAlpha(char) || char === "_") {
      const identifierSequence = this.extractIdentifierSequence();
      switch (identifierSequence) {
        case TokenRepresentation.PRINT:
          return new Token({ type: TokenType.PRINTLN });

        case TokenRepresentation.READ:
          return new Token({ type: TokenType.READ });

        case TokenRepresentation.IF:
          return new Token({ type: TokenType.IF });

        case TokenRepresentation.ELSE:
          return new Token({ type: TokenType.ELSE });

        case TokenRepresentation.WHILE:
          return new Token({ type: TokenType.WHILE });

        default:
          return new Token({
            type: TokenType.IDENTIFIER,
            value: identifierSequence,
          });
      }
    }

    throw new Error(`Unknown token ${char}`);
  }

  public selectNext(lineNumber: number = -1) {
    this.next = this.extractToken();
  }
}

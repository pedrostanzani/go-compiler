import { Token } from "./Token";
import { Tokenizer } from "./Tokenizer";
import { TokenType } from "../lib/enums";

export class Parser {
  private static tokenizer: Tokenizer;

  static throwUnexpectedToken() {
    const nextToken: Token = this.tokenizer.getNext();
    if (nextToken.type === TokenType.EOF) {
      throw new Error("Premature EOF.");
    } else throw new Error("Unexpected non-integer token.");
  }

  static parseFactor(): number {
    let result = 0;
    let nextToken: Token = this.tokenizer.getNext();

    if (nextToken.getType() === TokenType.INT) {
      result = nextToken.getValue();
      this.tokenizer.selectNext();
      return result;
    }

    if (nextToken.getType() === TokenType.PLUS) {
      this.tokenizer.selectNext();
      result = this.parseFactor();
      return result;
    }

    if (nextToken.getType() === TokenType.MINUS) {
      this.tokenizer.selectNext();
      result = -this.parseFactor();
      return result;
    }

    if (nextToken.getType() === TokenType.OPEN_PAR) {
      this.tokenizer.selectNext();
      result = this.parseExpression();
      nextToken = this.tokenizer.getNext();
      if (nextToken.getType() === TokenType.CLOSE_PAR) {
        this.tokenizer.selectNext();
        return result;
      } else {
        this.throwUnexpectedToken();
      }
    }

    this.throwUnexpectedToken();
    return result;
  }

  static parseTerm() {
    let result = this.parseFactor();
    let nextToken: Token = this.tokenizer.getNext();

    while (
      nextToken.type === TokenType.X ||
      nextToken.type === TokenType.DIVIDE
    ) {
      if (nextToken.type === TokenType.X) {
        nextToken = this.tokenizer.selectNext();
        result *= this.parseFactor();
      } else {
        nextToken = this.tokenizer.selectNext();
        result = Math.floor(result / this.parseFactor());
      }

      nextToken = this.tokenizer.getNext();
    }

    return result;
  }

  static parseExpression() {
    let result = this.parseTerm();
    let nextToken: Token = this.tokenizer.getNext();

    while (
      nextToken.type === TokenType.MINUS ||
      nextToken.type === TokenType.PLUS
    ) {
      if (nextToken.type === TokenType.PLUS) {
        nextToken = this.tokenizer.selectNext();
        result += this.parseTerm();
      } else {
        nextToken = this.tokenizer.selectNext();
        result -= this.parseTerm();
      }

      nextToken = this.tokenizer.getNext();
    }

    return result;
  }

  static run(sourceCode: string) {
    this.tokenizer = new Tokenizer({ source: sourceCode, position: 0 });
    let result = this.parseExpression();

    const nextToken = this.tokenizer.getNext();
    if (nextToken.getType() !== TokenType.EOF) {
      throw new Error("Could not detect EOF.");
    }

    return result;
  }
}

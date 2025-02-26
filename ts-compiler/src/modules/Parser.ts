import { Token } from "./Token";
import { Tokenizer } from "./Tokenizer";
import { TokenType } from "../lib/enums";

export class Parser {
  private static tokenizer: Tokenizer;

  static throwUnexpectedToken() {
    const nextToken: Token = this.tokenizer.getNext();
    if (nextToken.type === TokenType.EOF) {
      throw new Error("Premature EOF.")
    } else throw new Error("Unexpected non-integer token.")
  }

  static parseTerm() {
    let result = 0;
    let nextToken: Token = this.tokenizer.getNext();

    if (nextToken.getType() === TokenType.INT) {
      result = nextToken.getValue();
      nextToken = this.tokenizer.fetchAndSelectNext();

      while (nextToken.type === TokenType.X || nextToken.type === TokenType.DIVIDE) {
        if (nextToken.type === TokenType.X) {
          nextToken = this.tokenizer.fetchAndSelectNext();
          if (nextToken.type === TokenType.INT) {
            result *= nextToken.value;
          } else this.throwUnexpectedToken();
        } else {
          nextToken = this.tokenizer.fetchAndSelectNext();
          if (nextToken.type === TokenType.INT) {
            result = Math.floor(result / nextToken.value);
          } else this.throwUnexpectedToken();
        }

        nextToken = this.tokenizer.fetchAndSelectNext();
      }
    } else {
      this.throwUnexpectedToken();
    }

    return result;
  }

  static parseExpression() {
    let result = this.parseTerm();
    let nextToken: Token = this.tokenizer.getNext();

    while (nextToken.type === TokenType.MINUS || nextToken.type === TokenType.PLUS) {
      if (nextToken.type === TokenType.PLUS) {
        nextToken = this.tokenizer.fetchAndSelectNext();
        result += this.parseTerm();
      } else {
        nextToken = this.tokenizer.fetchAndSelectNext();
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

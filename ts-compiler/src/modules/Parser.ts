import { Token } from "./Token";
import { Tokenizer } from "./Tokenizer";

export class Parser {
  private static tokenizer: Tokenizer;

  static throwUnexpectedToken() {
    const nextToken: Token = this.tokenizer.getNext();
    if (nextToken.type === "EOF") {
      throw new Error("Premature EOF.")
    } else throw new Error("Unexpected non-integer token.")
  }

  static parseExpression() {
    let result = 0;
    let nextToken: Token = this.tokenizer.getNext();

    if (nextToken.getType() === "INT") {
      result = nextToken.getValue();
      nextToken = this.tokenizer.fetchAndSelectNext();

      while (nextToken.type === "MINUS" || nextToken.type === "PLUS") {
        if (nextToken.type === "PLUS") {
          nextToken = this.tokenizer.fetchAndSelectNext();
          if (nextToken.type === "INT") {
            result += nextToken.value;
          } else this.throwUnexpectedToken();
        } else {
          nextToken = this.tokenizer.fetchAndSelectNext();
          if (nextToken.type === "INT") {
            result -= nextToken.value;
          } else this.throwUnexpectedToken();
        }

        nextToken = this.tokenizer.fetchAndSelectNext();
      }
    } else {
      this.throwUnexpectedToken();
    }

    return result;
  }

  static run(sourceCode: string) {
    this.tokenizer = new Tokenizer({ source: sourceCode, position: 0 });
    let result = this.parseExpression();

    const nextToken = this.tokenizer.getNext();
    if (nextToken.getType() !== "EOF") {
      throw new Error("Could not detect EOF.");
    }

    return result;
  }
}

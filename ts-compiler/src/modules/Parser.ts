import { Token } from "./Token";
import { Tokenizer } from "./Tokenizer";
import { TokenType } from "../lib/enums";
import { PrePro } from "./PrePro";
import { BinOp, GenericTreeNode, IntVal, UnOp } from "./Node";

export class Parser {
  private static tokenizer: Tokenizer;

  static throwUnexpectedToken() {
    const nextToken: Token = this.tokenizer.getNext();
    if (nextToken.type === TokenType.EOF) {
      throw new Error("Premature EOF.");
    } else throw new Error("Unexpected non-integer token.");
  }

  static parseFactor(): GenericTreeNode {
    // let result = 0;
    let nextToken: Token = this.tokenizer.getNext();

    if (nextToken.getType() === TokenType.INT) {
      // result = nextToken.getValue();
      const node = new IntVal({ value: nextToken.getValue(), children: [] });
      this.tokenizer.selectNext();
      return node;
    }

    if (nextToken.getType() === TokenType.PLUS) {
      this.tokenizer.selectNext();
      // result = this.parseFactor();
      const node = new UnOp({
        value: TokenType.PLUS,
        children: [this.parseFactor()],
      });
      return node;
    }

    if (nextToken.getType() === TokenType.MINUS) {
      this.tokenizer.selectNext();
      // result = -this.parseFactor();
      const node = new UnOp({
        value: TokenType.MINUS,
        children: [this.parseFactor()],
      });
      return node;
    }

    if (nextToken.getType() === TokenType.OPEN_PAR) {
      this.tokenizer.selectNext();
      // result = this.parseExpression();
      const node = this.parseExpression();
      nextToken = this.tokenizer.getNext();
      if (nextToken.getType() === TokenType.CLOSE_PAR) {
        this.tokenizer.selectNext();
        return node;
      } else {
        this.throwUnexpectedToken();
      }
    }

    this.throwUnexpectedToken();
    return new IntVal({ value: 0, children: [] });
  }

  static parseTerm(): GenericTreeNode {
    // let result = this.parseFactor();
    let node: GenericTreeNode = this.parseFactor();
    let nextToken: Token = this.tokenizer.getNext();

    while (
      nextToken.type === TokenType.X ||
      nextToken.type === TokenType.DIVIDE
    ) {
      if (nextToken.type === TokenType.X) {
        nextToken = this.tokenizer.selectNext();
        // result *= this.parseFactor();
        node = new BinOp({
          value: TokenType.X,
          children: [node, this.parseFactor()],
        });
      } else {
        nextToken = this.tokenizer.selectNext();
        // result = Math.floor(result / this.parseFactor());
        node = new BinOp({
          value: TokenType.DIVIDE,
          children: [node, this.parseFactor()],
        });
      }

      nextToken = this.tokenizer.getNext();
    }

    return node;
  }

  static parseExpression(): GenericTreeNode {
    // let result = this.parseTerm();
    let node: GenericTreeNode = this.parseTerm();
    let nextToken: Token = this.tokenizer.getNext();

    while (
      nextToken.type === TokenType.MINUS ||
      nextToken.type === TokenType.PLUS
    ) {
      if (nextToken.type === TokenType.PLUS) {
        nextToken = this.tokenizer.selectNext();
        // result += this.parseTerm();
        node = new BinOp({
          value: TokenType.PLUS,
          children: [node, this.parseTerm()],
        });
      } else {
        nextToken = this.tokenizer.selectNext();
        // result -= this.parseTerm();
        node = new BinOp({
          value: TokenType.MINUS,
          children: [node, this.parseTerm()],
        });
      }

      nextToken = this.tokenizer.getNext();
    }

    return node;
  }

  static run(sourceCode: string): GenericTreeNode {
    this.tokenizer = new Tokenizer({
      source: PrePro.filter(sourceCode),
      position: 0,
    });
    let result = this.parseExpression();

    const nextToken = this.tokenizer.getNext();
    if (nextToken.getType() !== TokenType.EOF) {
      throw new Error("Could not detect EOF.");
    }

    return result;
  }
}

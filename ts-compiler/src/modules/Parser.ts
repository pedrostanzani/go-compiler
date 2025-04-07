import { Token } from "./Token";
import { Tokenizer } from "./Tokenizer";
import { TokenType } from "../lib/enums";
import { PrePro } from "./PrePro";
import {
  Assignment,
  BinOp,
  Block,
  GenericTreeNode,
  Identifier,
  IntVal,
  NoOp,
  Print,
  TreeNode,
  UnOp,
} from "./Node";

export class Parser {
  private static tokenizer: Tokenizer;

  static throwUnexpectedToken(
    errorMessage: string = "Unexpected token."
  ): never {
    if (this.tokenizer.getNext().type === TokenType.EOF) {
      throw new Error("Premature EOF.");
    } else throw new Error(errorMessage);
  }

  static parseFactor(): GenericTreeNode {
    let nextToken: Token = this.tokenizer.getNext(); // 3

    if (nextToken.getType() === TokenType.INT) {
      const node = new IntVal({ value: nextToken.getNumericValue(), children: [] });
      this.tokenizer.selectNext(35); // \n
      return node;
    }

    if (nextToken.getType() === TokenType.IDENTIFIER) {
      const node = new Identifier({ token: nextToken });
      this.tokenizer.selectNext(41); // )
      return node;
    }

    if (nextToken.getType() === TokenType.PLUS) {
      this.tokenizer.selectNext(46);
      const node = new UnOp({
        value: TokenType.PLUS,
        children: [this.parseFactor()],
      });
      return node;
    }

    if (nextToken.getType() === TokenType.MINUS) {
      this.tokenizer.selectNext(55);
      const node = new UnOp({
        value: TokenType.MINUS,
        children: [this.parseFactor()],
      });
      return node;
    }

    if (nextToken.getType() === TokenType.OPEN_PAR) {
      this.tokenizer.selectNext(64);
      const node = this.parseExpression();
      nextToken = this.tokenizer.getNext();
      if (nextToken.getType() === TokenType.CLOSE_PAR) {
        this.tokenizer.selectNext(68);
        return node;
      } else {
        this.throwUnexpectedToken();
      }
    }

    this.throwUnexpectedToken();
  }

  static parseTerm(): GenericTreeNode {
    let node: GenericTreeNode = this.parseFactor();
    let nextToken: Token = this.tokenizer.getNext(); // \n

    while (
      nextToken.type === TokenType.X ||
      nextToken.type === TokenType.DIVIDE
    ) {
      if (nextToken.type === TokenType.X) {
        nextToken = this.tokenizer.selectNext(87);
        node = new BinOp({
          value: TokenType.X,
          children: [node, this.parseFactor()],
        });
      } else {
        nextToken = this.tokenizer.selectNext(93);
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
    let node: GenericTreeNode = this.parseTerm();
    let nextToken: Token = this.tokenizer.getNext(); // \n

    while (
      nextToken.type === TokenType.MINUS ||
      nextToken.type === TokenType.PLUS
    ) {
      if (nextToken.type === TokenType.PLUS) {
        nextToken = this.tokenizer.selectNext(115);
        node = new BinOp({
          value: TokenType.PLUS,
          children: [node, this.parseTerm()],
        });
      } else {
        nextToken = this.tokenizer.selectNext(121);
        node = new BinOp({
          value: TokenType.MINUS,
          children: [node, this.parseTerm()],
        });
      }

      nextToken = this.tokenizer.getNext();
    }

    return node;
  }

  static parseStatement(): GenericTreeNode {
    let nextToken: Token = this.tokenizer.getNext(); // pedro

    if (nextToken.getType() === TokenType.IDENTIFIER) {
      const identifier = new Identifier({ token: nextToken });
      nextToken = this.tokenizer.selectNext(139); // =
      if (nextToken.getType() === TokenType.ASSIGNMENT) {
        nextToken = this.tokenizer.selectNext(141); // 3
        const expression = this.parseExpression();
        const assignment = new Assignment({
          children: [identifier, expression],
        });

        nextToken = this.tokenizer.getNext();
        if (nextToken.getType() === TokenType.NEW_LINE) {
          this.tokenizer.selectNext(148);
          return assignment;
        }

      }

      this.throwUnexpectedToken();
    }

    if (nextToken.getType() === TokenType.PRINTLN) {
      nextToken = this.tokenizer.selectNext(157); // (
      if (nextToken.getType() === TokenType.OPEN_PAR) {
        nextToken = this.tokenizer.selectNext(159); // pedro
        const print = new Print({ children: [this.parseExpression()] });
        nextToken = this.tokenizer.getNext(); // )
        if (nextToken.getType() === TokenType.CLOSE_PAR) {
          nextToken = this.tokenizer.selectNext(); // \n
          if (nextToken.getType() === TokenType.NEW_LINE) {
            this.tokenizer.selectNext(165);
            return print;
          }
        }
      }

      this.throwUnexpectedToken();
    }

    if (nextToken.getType() === TokenType.NEW_LINE) {
      this.tokenizer.selectNext(175);
      return new NoOp();
    }
    
    this.throwUnexpectedToken();
  }

  static parseBlock(): GenericTreeNode {
    if (this.tokenizer.getNext().getType() === TokenType.OPEN_BRAC) {
      this.tokenizer.selectNext(186); // \n
      if (this.tokenizer.getNext().getType() === TokenType.NEW_LINE) {
        this.tokenizer.selectNext(188); // pedro
        const statements: GenericTreeNode[] = [];
        while (this.tokenizer.getNext().getType() !== TokenType.CLOSE_BRAC) {
          statements.push(this.parseStatement());
        }
        this.tokenizer.selectNext(193);
        return new Block({ children: statements });
      } else this.throwUnexpectedToken();
    } else {
      this.throwUnexpectedToken()
    };

    this.throwUnexpectedToken();
  }

  static run(sourceCode: string): GenericTreeNode {
    this.tokenizer = new Tokenizer({
      source: PrePro.filter(sourceCode),
      position: 0,
    });
    let result = this.parseBlock();

    if (this.tokenizer.getNext().getType() !== TokenType.EOF) {
      throw new Error("Could not detect EOF.");
    }

    return result;
  }
}

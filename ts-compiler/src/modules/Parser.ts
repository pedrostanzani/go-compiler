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
    if (this.tokenizer.getNext().getType() === TokenType.INT) {
      const node = new IntVal({ value: this.tokenizer.getNext().getNumericValue(), children: [] });
      this.tokenizer.selectNext(35); // \n
      return node;
    }

    if (this.tokenizer.getNext().getType() === TokenType.IDENTIFIER) {
      const node = new Identifier({ token: this.tokenizer.getNext() });
      this.tokenizer.selectNext(41); // )
      return node;
    }

    if (this.tokenizer.getNext().getType() === TokenType.PLUS) {
      this.tokenizer.selectNext(46);
      const node = new UnOp({
        value: TokenType.PLUS,
        children: [this.parseFactor()],
      });
      return node;
    }

    if (this.tokenizer.getNext().getType() === TokenType.MINUS) {
      this.tokenizer.selectNext(55);
      const node = new UnOp({
        value: TokenType.MINUS,
        children: [this.parseFactor()],
      });
      return node;
    }

    if (this.tokenizer.getNext().getType() === TokenType.OPEN_PAR) {
      this.tokenizer.selectNext(64);
      const node = this.parseExpression();
      if (this.tokenizer.getNext().getType() === TokenType.CLOSE_PAR) {
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

    while (
      this.tokenizer.getNext().type === TokenType.X ||
      this.tokenizer.getNext().type === TokenType.DIVIDE
    ) {
      if (this.tokenizer.getNext().type === TokenType.X) {
        this.tokenizer.selectNext(87);
        node = new BinOp({
          value: TokenType.X,
          children: [node, this.parseFactor()],
        });
      } else {
        this.tokenizer.selectNext(93);
        node = new BinOp({
          value: TokenType.DIVIDE,
          children: [node, this.parseFactor()],
        });
      }
    }

    return node;
  }

  static parseExpression(): GenericTreeNode {
    let node: GenericTreeNode = this.parseTerm();

    while (
      this.tokenizer.getNext().type === TokenType.MINUS ||
      this.tokenizer.getNext().type === TokenType.PLUS
    ) {
      if (this.tokenizer.getNext().type === TokenType.PLUS) {
        this.tokenizer.selectNext(115);
        node = new BinOp({
          value: TokenType.PLUS,
          children: [node, this.parseTerm()],
        });
      } else {
        this.tokenizer.selectNext(121);
        node = new BinOp({
          value: TokenType.MINUS,
          children: [node, this.parseTerm()],
        });
      }
    }

    return node;
  }

  static parseStatement(): GenericTreeNode {
    if (this.tokenizer.getNext().getType() === TokenType.IDENTIFIER) {
      const identifier = new Identifier({ token: this.tokenizer.getNext() });
      this.tokenizer.selectNext(139); // =
      if (this.tokenizer.getNext().getType() === TokenType.ASSIGNMENT) {
        this.tokenizer.selectNext(141); // 3
        const expression = this.parseExpression();
        const assignment = new Assignment({
          children: [identifier, expression],
        });

        if (this.tokenizer.getNext().getType() === TokenType.NEW_LINE) {
          this.tokenizer.selectNext(148);
          return assignment;
        }

      }

      this.throwUnexpectedToken();
    }

    if (this.tokenizer.getNext().getType() === TokenType.PRINTLN) {
      this.tokenizer.selectNext(157); // (
      if (this.tokenizer.getNext().getType() === TokenType.OPEN_PAR) {
        this.tokenizer.selectNext(159); // pedro
        const print = new Print({ children: [this.parseExpression()] });
        if (this.tokenizer.getNext().getType() === TokenType.CLOSE_PAR) {
          this.tokenizer.selectNext(); // \n
          if (this.tokenizer.getNext().getType() === TokenType.NEW_LINE) {
            this.tokenizer.selectNext(165);
            return print;
          }
        }
      }

      this.throwUnexpectedToken();
    }

    if (this.tokenizer.getNext().getType() === TokenType.NEW_LINE) {
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

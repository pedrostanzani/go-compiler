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
  If,
  IntVal,
  NoOp,
  Print,
  Scan,
  TreeNode,
  UnOp,
  While,
} from "./Node";
import { isTruthy } from "../lib/utils";

export class Parser {
  private static tokenizer: Tokenizer;

  static throwUnexpectedToken(
    errorMessage: string = "Unexpected token.",
    line: number = -1
  ): never {
    if (line !== -1) {
      // console.log(line);
    }
    
    if (this.tokenizer.getNext().type === TokenType.EOF) {
      throw new Error("Premature EOF.");
    } else throw new Error(errorMessage);
  }

  static parseFactor(): GenericTreeNode {
    let nextToken: Token = this.tokenizer.getNext(); // 3

    if (nextToken.getType() === TokenType.INT) {
      const node = new IntVal({
        value: nextToken.getNumericValue(),
        children: [],
      });
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

    if (nextToken.getType() === TokenType.NOT) {
      this.tokenizer.selectNext();
      const node = new UnOp({
        value: TokenType.NOT,
        children: [this.parseFactor()],
      });
      return node;
    }

    if (nextToken.getType() === TokenType.OPEN_PAR) {
      this.tokenizer.selectNext(64);
      const node = this.parseBooleanExpression();
      nextToken = this.tokenizer.getNext();
      if (nextToken.getType() === TokenType.CLOSE_PAR) {
        this.tokenizer.selectNext(68);
        return node;
      } else {
        this.throwUnexpectedToken("Unexpected token.", 91);
      }
    }

    if (nextToken.getType() === TokenType.READ) {
      nextToken = this.tokenizer.selectNext();
      if (nextToken.getType() === TokenType.OPEN_PAR) {
        nextToken = this.tokenizer.selectNext();
        if (nextToken.getType() === TokenType.CLOSE_PAR) {
          this.tokenizer.selectNext();
          return new Scan();
        } else {
          this.throwUnexpectedToken("Unexpected token.", 103);
        }
      } else {
        this.throwUnexpectedToken("Unexpected token.", 106);
      }
    }

    this.throwUnexpectedToken("Unexpected token.", 110);
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

  static parseRelationalExpression(): GenericTreeNode {
    let node: GenericTreeNode = this.parseExpression();
    let nextToken: Token = this.tokenizer.getNext();

    while (
      nextToken.type === TokenType.EQUALS ||
      nextToken.type === TokenType.GREATER_THAN ||
      nextToken.type === TokenType.LESS_THAN
    ) {
      if (nextToken.type === TokenType.EQUALS) {
        nextToken = this.tokenizer.selectNext();
        node = new BinOp({
          value: TokenType.EQUALS,
          children: [node, this.parseExpression()],
        });
      } else if (nextToken.type === TokenType.GREATER_THAN) {
        nextToken = this.tokenizer.selectNext();
        node = new BinOp({
          value: TokenType.GREATER_THAN,
          children: [node, this.parseExpression()],
        });
      } else {
        nextToken = this.tokenizer.selectNext();
        node = new BinOp({
          value: TokenType.LESS_THAN,
          children: [node, this.parseExpression()],
        });
      }

      nextToken = this.tokenizer.getNext();
    }

    return node;
  }

  static parseBooleanTerm(): GenericTreeNode {
    let node: GenericTreeNode = this.parseRelationalExpression();
    let nextToken: Token = this.tokenizer.getNext();

    while (nextToken.type === TokenType.AND) {
      nextToken = this.tokenizer.selectNext();
      node = new BinOp({
        value: TokenType.AND,
        children: [node, this.parseRelationalExpression()],
      });

      nextToken = this.tokenizer.getNext();
    }

    return node;
  }

  static parseBooleanExpression(): GenericTreeNode {
    let node: GenericTreeNode = this.parseBooleanTerm();
    let nextToken: Token = this.tokenizer.getNext();

    while (nextToken.type === TokenType.OR) {
      nextToken = this.tokenizer.selectNext();
      node = new BinOp({
        value: TokenType.OR,
        children: [node, this.parseBooleanTerm()],
      });

      nextToken = this.tokenizer.getNext();
    }

    return node;
  }

  static parseStatement(): GenericTreeNode {
    let nextToken: Token = this.tokenizer.getNext();

    if (nextToken.getType() === TokenType.IDENTIFIER) {
      const identifier = new Identifier({ token: nextToken });
      nextToken = this.tokenizer.selectNext(139);
      if (nextToken.getType() === TokenType.ASSIGNMENT) {
        nextToken = this.tokenizer.selectNext(141);
        const expression = this.parseBooleanExpression();
        const assignment = new Assignment({
          children: [identifier, expression],
        });

        nextToken = this.tokenizer.getNext();
        if (nextToken.getType() === TokenType.NEW_LINE) {
          this.tokenizer.selectNext(148);
          return assignment;
        }
      }

      this.throwUnexpectedToken("Unexpected token.", 258);
    }

    if (nextToken.getType() === TokenType.PRINTLN) {
      nextToken = this.tokenizer.selectNext(157); // (
      if (nextToken.getType() === TokenType.OPEN_PAR) {
        nextToken = this.tokenizer.selectNext(159); // pedro
        const print = new Print({ children: [this.parseBooleanExpression()] });
        nextToken = this.tokenizer.getNext(); // )
        if (nextToken.getType() === TokenType.CLOSE_PAR) {
          nextToken = this.tokenizer.selectNext(); // \n
          if (nextToken.getType() === TokenType.NEW_LINE) {
            this.tokenizer.selectNext(165);
            return print;
          }
        }
      }

      this.throwUnexpectedToken("Unexpected token.", 276);
    }

    if (nextToken.getType() === TokenType.WHILE) {
      nextToken = this.tokenizer.selectNext();
      return new While({
        children: [this.parseBooleanExpression(), this.parseBlock()],
      });
    }

    if (nextToken.getType() === TokenType.IF) {
      nextToken = this.tokenizer.selectNext();
      const condition = this.parseBooleanExpression();
      const ifBlock = this.parseBlock()

      nextToken = this.tokenizer.selectNext();

      const elseBlock = nextToken.getType() === TokenType.ELSE ? this.parseBlock() : null;
      const children = [condition, ifBlock];
      if (isTruthy(elseBlock)) {
        children.push(elseBlock);
      }

      return new If({ children });
    }

    if (nextToken.getType() === TokenType.NEW_LINE) {
      this.tokenizer.selectNext(175);
      return new NoOp();
    }

    this.throwUnexpectedToken("Unexpected token.", 306);
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
      } else this.throwUnexpectedToken("Unexpected token.", 320);
    } else {
      this.throwUnexpectedToken("Unexpected token.", 322);
    }

    this.throwUnexpectedToken("Unexpected token.", 325);
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

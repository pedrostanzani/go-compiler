import { Token } from "./Token";
import { Tokenizer } from "./Tokenizer";
import { TokenType } from "../lib/enums";
import { PrePro } from "./PrePro";
import { Debug } from "../lib/debug";
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

  static throwUnexpectedToken({
    fn,
    details,
    errorMessage = "Unexpected token.",
  }: {
    fn: string;
    details: string;
    errorMessage?: string;
  }): never {
    if (this.tokenizer.getNext().type === TokenType.EOF) {
      throw new Error("Premature EOF.");
    } else {
      Debug.log(`Current position: ${this.tokenizer.position}`)
      Debug.log(`Next token: ${this.tokenizer.getNext().getType()}`)
      Debug.log(`Raw source code:`)
      Debug.log(`---`)
      Debug.log(this.tokenizer.source)
      Debug.log(`---`)

      Debug.log(`Error thown from: ${fn}`);
      Debug.log(`Details: ${details}`);
      throw new Error(errorMessage);
    }
  }

  static parseFactor(): GenericTreeNode {
    if (this.tokenizer.getNext().getType() === TokenType.INT) {
      const node = new IntVal({
        value: this.tokenizer.getNext().getNumericValue(),
        children: [],
      });
      this.tokenizer.selectNext();
      return node;
    }

    if (this.tokenizer.getNext().getType() === TokenType.IDENTIFIER) {
      const node = new Identifier({ token: this.tokenizer.getNext() });
      this.tokenizer.selectNext();
      return node;
    }

    if (this.tokenizer.getNext().getType() === TokenType.PLUS) {
      this.tokenizer.selectNext();
      const node = new UnOp({
        value: TokenType.PLUS,
        children: [this.parseFactor()],
      });
      return node;
    }

    if (this.tokenizer.getNext().getType() === TokenType.MINUS) {
      this.tokenizer.selectNext();
      const node = new UnOp({
        value: TokenType.MINUS,
        children: [this.parseFactor()],
      });
      return node;
    }

    if (this.tokenizer.getNext().getType() === TokenType.NOT) {
      this.tokenizer.selectNext();
      const node = new UnOp({
        value: TokenType.NOT,
        children: [this.parseFactor()],
      });
      return node;
    }

    if (this.tokenizer.getNext().getType() === TokenType.OPEN_PAR) {
      this.tokenizer.selectNext();
      const node = this.parseBooleanExpression();
      if (this.tokenizer.getNext().getType() === TokenType.CLOSE_PAR) {
        this.tokenizer.selectNext();
        return node;
      } else {
        this.throwUnexpectedToken({
          fn: "parseFactor",
          details: "OPEN_PAR",
        });
      }
    }

    if (this.tokenizer.getNext().getType() === TokenType.READ) {
      this.tokenizer.selectNext();
      if (this.tokenizer.getNext().getType() === TokenType.OPEN_PAR) {
        this.tokenizer.selectNext();
        if (this.tokenizer.getNext().getType() === TokenType.CLOSE_PAR) {
          this.tokenizer.selectNext();
          return new Scan();
        }
      }

      this.throwUnexpectedToken({
        fn: "parseFactor",
        details: "READ",
      });
    }

    this.throwUnexpectedToken({
      fn: "parseFactor",
      details: "ESCAPE",
    });
  }

  static parseTerm(): GenericTreeNode {
    let node: GenericTreeNode = this.parseFactor();

    while (
      this.tokenizer.getNext().type === TokenType.X ||
      this.tokenizer.getNext().type === TokenType.DIVIDE
    ) {
      if (this.tokenizer.getNext().type === TokenType.X) {
        this.tokenizer.selectNext();
        node = new BinOp({
          value: TokenType.X,
          children: [node, this.parseFactor()],
        });
      } else {
        this.tokenizer.selectNext();
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
        this.tokenizer.selectNext();
        node = new BinOp({
          value: TokenType.PLUS,
          children: [node, this.parseTerm()],
        });
      } else {
        this.tokenizer.selectNext();
        node = new BinOp({
          value: TokenType.MINUS,
          children: [node, this.parseTerm()],
        });
      }
    }

    return node;
  }

  static parseRelationalExpression(): GenericTreeNode {
    let node: GenericTreeNode = this.parseExpression();

    while (
      this.tokenizer.getNext().type === TokenType.EQUALS ||
      this.tokenizer.getNext().type === TokenType.GREATER_THAN ||
      this.tokenizer.getNext().type === TokenType.LESS_THAN
    ) {
      if (this.tokenizer.getNext().type === TokenType.EQUALS) {
        this.tokenizer.selectNext();
        node = new BinOp({
          value: TokenType.EQUALS,
          children: [node, this.parseExpression()],
        });
      } else if (this.tokenizer.getNext().type === TokenType.GREATER_THAN) {
        this.tokenizer.selectNext();
        node = new BinOp({
          value: TokenType.GREATER_THAN,
          children: [node, this.parseExpression()],
        });
      } else {
        this.tokenizer.selectNext();
        node = new BinOp({
          value: TokenType.LESS_THAN,
          children: [node, this.parseExpression()],
        });
      }
    }

    return node;
  }

  static parseBooleanTerm(): GenericTreeNode {
    let node: GenericTreeNode = this.parseRelationalExpression();

    while (this.tokenizer.getNext().type === TokenType.AND) {
      this.tokenizer.selectNext();
      node = new BinOp({
        value: TokenType.AND,
        children: [node, this.parseRelationalExpression()],
      });
    }

    return node;
  }

  static parseBooleanExpression(): GenericTreeNode {
    let node: GenericTreeNode = this.parseBooleanTerm();

    while (this.tokenizer.getNext().type === TokenType.OR) {
      this.tokenizer.selectNext();
      node = new BinOp({
        value: TokenType.OR,
        children: [node, this.parseBooleanTerm()],
      });
    }

    return node;
  }

  static parseStatement(): GenericTreeNode {
    if (this.tokenizer.getNext().getType() === TokenType.IDENTIFIER) {
      const identifier = new Identifier({ token: this.tokenizer.getNext() });
      this.tokenizer.selectNext();
      if (this.tokenizer.getNext().getType() === TokenType.ASSIGNMENT) {
        this.tokenizer.selectNext();
        const expression = this.parseBooleanExpression();
        const assignment = new Assignment({
          children: [identifier, expression],
        });

        if (this.tokenizer.getNext().getType() === TokenType.NEW_LINE) {
          this.tokenizer.selectNext();
          return assignment;
        }
      }

      this.throwUnexpectedToken({
        fn: "parseStatement",
        details: "IDENTIFIER",
      });
    }

    if (this.tokenizer.getNext().getType() === TokenType.PRINTLN) {
      this.tokenizer.selectNext();
      if (this.tokenizer.getNext().getType() === TokenType.OPEN_PAR) {
        this.tokenizer.selectNext();
        const print = new Print({ children: [this.parseBooleanExpression()] });
        if (this.tokenizer.getNext().getType() === TokenType.CLOSE_PAR) {
          this.tokenizer.selectNext();
          if (this.tokenizer.getNext().getType() === TokenType.NEW_LINE) {
            this.tokenizer.selectNext();
            return print;
          }
        }
      }

      this.throwUnexpectedToken({
        fn: "parseStatement",
        details: "PRINTLN",
      });
    }

    if (this.tokenizer.getNext().getType() === TokenType.WHILE) {
      this.tokenizer.selectNext();
      const booleanExpression = this.parseBooleanExpression();
      // this.tokenizer.selectNext();
      const whileNode = new While({
        children: [booleanExpression, this.parseBlock()],
      });

      if (this.tokenizer.getNext().getType() === TokenType.NEW_LINE) {
        this.tokenizer.selectNext();
        return whileNode;
      }

      this.throwUnexpectedToken({
        fn: "parseStatement",
        details: "WHILE",
      });
    }

    if (this.tokenizer.getNext().getType() === TokenType.IF) {
      this.tokenizer.selectNext();
      const booleanExpression = this.parseBooleanExpression();
      // this.tokenizer.selectNext();
      const ifBlock = this.parseBlock();

      if (this.tokenizer.getNext().getType() === TokenType.ELSE) {
        this.tokenizer.selectNext();
        const elseBlock = this.parseBlock();
        // this.tokenizer.selectNext();
        if (this.tokenizer.getNext().getType() === TokenType.NEW_LINE) {
          return new If({ children: [booleanExpression, ifBlock, elseBlock] });
        } else {
          this.throwUnexpectedToken({
            fn: "parseStatement",
            details: "ELSE/NEW_LINE",
          });
        }
      } else if (this.tokenizer.getNext().getType() === TokenType.NEW_LINE) {
        this.tokenizer.selectNext();
        return new If({ children: [booleanExpression, ifBlock] });
      }

      this.throwUnexpectedToken({
        fn: "parseStatement",
        details: "IF",
      });
    }

    if (this.tokenizer.getNext().getType() === TokenType.NEW_LINE) {
      this.tokenizer.selectNext();
      return new NoOp();
    }

    this.throwUnexpectedToken({
      fn: "parseStatement",
      details: "ESCAPE",
    });
  }

  static parseBlock(): GenericTreeNode {
    if (this.tokenizer.getNext().getType() === TokenType.OPEN_BRAC) {
      this.tokenizer.selectNext();
      if (this.tokenizer.getNext().getType() === TokenType.NEW_LINE) {
        this.tokenizer.selectNext();
        const statements: GenericTreeNode[] = [];
        while (this.tokenizer.getNext().getType() !== TokenType.CLOSE_BRAC) {
          statements.push(this.parseStatement());
        }
        this.tokenizer.selectNext();
        return new Block({ children: statements });
      } else
        this.throwUnexpectedToken({
          fn: "parseBlock",
          details: "NEW_LINE",
        });
    } else {
      this.throwUnexpectedToken({
        fn: "parseBlock",
        details: "ESCAPE",
      });
    }
  }

  static run(sourceCode: string): GenericTreeNode {
    this.tokenizer = new Tokenizer({
      source: PrePro.filter(sourceCode),
      position: 0,
    });
    let result = this.parseBlock();
    // Each parsing function should make sure that the next token is 'ready to go'
    // So if run() calls
    //  --> parseBlock()
    // By the time the parseBlock function execution ends, the nextToken should be whatever
    // comes after parseBlock in the diagram

    if (this.tokenizer.getNext().getType() !== TokenType.EOF) {
      throw new Error("Could not detect EOF.");
    }

    return result;
  }
}

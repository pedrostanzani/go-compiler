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

type ReadOnlyItems = readonly (TokenType | (() => GenericTreeNode))[];

type StoreFor<Items extends ReadOnlyItems> = {
  [K in keyof Items]: Items[K] extends TokenType
    ? Token
    : Items[K] extends () => GenericTreeNode
    ? GenericTreeNode
    : never;
};

interface Sequence<Items extends ReadOnlyItems, R> {
  items: Items;
  onFinish: (itemsStore: StoreFor<Items>) => R;
  throwErrorOnFirstItem?: boolean;
  errorDetails?: { fn: string; details: string };
}

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
      Debug.log(`Current position: ${this.tokenizer.position}`);
      Debug.log(`Next token: ${this.tokenizer.getNext().getType()}`);
      Debug.log(`Raw source code:`);
      Debug.log(`---`);
      Debug.log(this.tokenizer.source);
      Debug.log(`---`);

      Debug.log(`Error thown from: ${fn}`);
      Debug.log(`Details: ${details}`);
      throw new Error(errorMessage);
    }
  }

  static readSequential<Items extends ReadOnlyItems, R>(
    sequence: Sequence<Items, R> & { throwErrorOnFirstItem: false }
  ): R | null;

  static readSequential<Items extends ReadOnlyItems, R>(
    sequence: Sequence<Items, R> & { throwErrorOnFirstItem?: true }
  ): R;

  static readSequential<Items extends ReadOnlyItems, R>({
    throwErrorOnFirstItem = true,
    ...sequence
  }: Sequence<Items, R>): R | null {
    const itemsStore: Array<Token | GenericTreeNode> = [];

    for (let i = 0; i < sequence.items.length; i++) {
      const item = sequence.items[i];

      if (typeof item === "string") {
        if (this.tokenizer.getNext().getType() === item) {
          itemsStore.push(this.tokenizer.getNext());
          this.tokenizer.selectNext();
          continue;
        } else if (i === 0 && !throwErrorOnFirstItem) {
          return null;
        } else {
          this.throwUnexpectedToken(
            sequence.errorDetails ?? {
              fn: "readSequential",
              details: "GENERIC",
            }
          );
        }
      } else if (typeof item === "function") {
        const node = item.call(this);
        itemsStore.push(node);
      } else {
        throw new Error("Invalid sequence.");
      }
    }

    return sequence.onFinish(itemsStore as StoreFor<Items>);
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

    let node: GenericTreeNode | null;

    node = this.readSequential({
      items: [
        TokenType.OPEN_PAR,
        this.parseBooleanExpression,
        TokenType.CLOSE_PAR,
      ] as const,
      onFinish: (itemsStore) => {
        return itemsStore[1];
      },
      throwErrorOnFirstItem: false,
      errorDetails: {
        fn: "parseFactor",
        details: "OPEN_PAR",
      },
    });
    if (isTruthy(node)) return node;

    node = this.readSequential({
      items: [TokenType.READ, TokenType.OPEN_PAR, TokenType.CLOSE_PAR],
      onFinish: () => new Scan(),
      throwErrorOnFirstItem: false,
      errorDetails: {
        fn: "parseFactor",
        details: "READ",
      },
    });
    if (isTruthy(node)) return node;

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
    let node: GenericTreeNode | null;

    node = this.readSequential({
      items: [
        TokenType.IDENTIFIER,
        TokenType.ASSIGNMENT,
        this.parseBooleanExpression,
        TokenType.NEW_LINE,
      ] as const,
      onFinish: (itemsStore) => {
        const [identifierToken, _, expression] = itemsStore;
        const identifier = new Identifier({ token: identifierToken });
        return new Assignment({
          children: [identifier, expression],
        });
      },
      throwErrorOnFirstItem: false,
      errorDetails: { fn: "parseStatement", details: "IDENTIFIER" },
    });
    if (isTruthy(node)) return node;

    node = this.readSequential({
      items: [
        TokenType.PRINTLN,
        TokenType.OPEN_PAR,
        this.parseBooleanExpression,
        TokenType.CLOSE_PAR,
        TokenType.NEW_LINE,
      ] as const,
      onFinish: (itemsStore) => {
        const booleanExpression = itemsStore[2];
        return new Print({ children: [booleanExpression] });
      },
      throwErrorOnFirstItem: false,
      errorDetails: { fn: "parseStatement", details: "PRINTLN" },
    });
    if (isTruthy(node)) return node;

    node = this.readSequential({
      items: [
        TokenType.WHILE,
        this.parseBooleanExpression,
        this.parseBlock,
        TokenType.NEW_LINE,
      ] as const,
      onFinish: (itemsStore) => {
        const booleanExpression = itemsStore[1];
        const block = itemsStore[2];
        return new While({ children: [booleanExpression, block] });
      },
      throwErrorOnFirstItem: false,
      errorDetails: { fn: "parseStatement", details: "WHILE" },
    });
    if (isTruthy(node)) return node;

    if (this.tokenizer.getNext().getType() === TokenType.IF) {
      const [booleanExpression, ifBlock] = this.readSequential({
        items: [
          TokenType.IF,
          this.parseBooleanExpression,
          this.parseBlock,
        ] as const,
        onFinish: (itemsStore) => {
          const [_, booleanExpression, ifBlock] = itemsStore;
          return [booleanExpression, ifBlock];
        },
        errorDetails: { fn: "parseStatement", details: "IF" },
      });

      const node = this.readSequential({
        items: [TokenType.ELSE, this.parseBlock, TokenType.NEW_LINE],
        onFinish: (itemsStore) => {
          const elseBlock = itemsStore[1];
          return new If({ children: [booleanExpression, ifBlock, elseBlock] });
        },
        throwErrorOnFirstItem: false,
        errorDetails: { fn: "parseStatement", details: "IF/ELSE" },
      });
      if (isTruthy(node)) return node;

      return this.readSequential({
        items: [TokenType.NEW_LINE],
        onFinish: () => new If({ children: [booleanExpression, ifBlock] }),
        errorDetails: { fn: "parseStatement", details: "IF/NEW_LINE" },
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

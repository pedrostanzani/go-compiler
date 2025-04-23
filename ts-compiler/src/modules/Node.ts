import { TokenType } from "../lib/enums";
import { SymbolTable } from "./SymbolTable";
import { Token } from "./Token";

type Operator =
  | TokenType.PLUS
  | TokenType.MINUS
  | TokenType.X
  | TokenType.DIVIDE;
type Variant = number | string | Operator | null;

export interface TreeNode<V> {
  value: V;
  children: TreeNode<Variant>[];
  evaluate: (symbolTable: SymbolTable) => number;
}

export type GenericTreeNode = TreeNode<Variant>;

export class BinOp implements TreeNode<Operator> {
  value: Operator;
  children: GenericTreeNode[];

  constructor({
    value,
    children,
  }: {
    value: Operator;
    children: GenericTreeNode[];
  }) {
    this.value = value;
    this.children = children;
  }

  evaluate(symbolTable: SymbolTable) {
    const [firstChild, secondChild] = this.children;

    switch (this.value) {
      case TokenType.PLUS:
        return (
          firstChild.evaluate(symbolTable) + secondChild.evaluate(symbolTable)
        );

      case TokenType.MINUS:
        return (
          firstChild.evaluate(symbolTable) - secondChild.evaluate(symbolTable)
        );

      case TokenType.DIVIDE:
        return Math.floor(
          firstChild.evaluate(symbolTable) / secondChild.evaluate(symbolTable)
        );

      case TokenType.X:
        return (
          firstChild.evaluate(symbolTable) * secondChild.evaluate(symbolTable)
        );

      default:
        break;
    }

    return 0;
  }
}

export class UnOp implements TreeNode<TokenType.PLUS | TokenType.MINUS> {
  value: TokenType.PLUS | TokenType.MINUS;
  children: GenericTreeNode[];

  constructor({
    value,
    children,
  }: {
    value: TokenType.PLUS | TokenType.MINUS;
    children: GenericTreeNode[];
  }) {
    this.value = value;
    this.children = children;
  }

  evaluate(symbolTable: SymbolTable) {
    const child = this.children[0];

    if (this.value === TokenType.MINUS) {
      return -child.evaluate(symbolTable);
    } else {
      return child.evaluate(symbolTable);
    }
  }
}

export class IntVal implements TreeNode<number> {
  value: number;
  children: TreeNode<never>[];

  constructor({
    value,
    children,
  }: {
    value: number;
    children: TreeNode<never>[];
  }) {
    this.value = value;
    this.children = children;
  }

  evaluate() {
    return this.value;
  }
}

export class NoOp implements TreeNode<null> {
  value: null;
  children: TreeNode<never>[];

  constructor() {
    this.value = null;
    this.children = [];
  }

  evaluate() {
    return this.value ?? 0;
  }
}

export class Identifier implements TreeNode<string> {
  value: string;
  children: TreeNode<never>[];

  constructor({ token }: { token: Token }) {
    if (token.getType() !== TokenType.IDENTIFIER) {
      throw new Error("Expected identifier token.");
    }

    this.value = token.getStringValue();
    this.children = [];
  }

  evaluate(symbolTable: SymbolTable) {
    return symbolTable.get(this.value);
  }
}

export class Block implements TreeNode<null> {
  value: null;
  children: GenericTreeNode[];

  constructor({ children }: { children: GenericTreeNode[] }) {
    this.value = null;
    this.children = children;
  }

  evaluate(symbolTable: SymbolTable) {
    this.children.forEach((child) => {
      child.evaluate(symbolTable);
    });

    return 0;
  }
}

export class Print implements TreeNode<null> {
  value: null;
  children: GenericTreeNode[];

  constructor({ children }: { children: GenericTreeNode[] }) {
    this.value = null;
    this.children = children;
  }

  evaluate(symbolTable: SymbolTable) {
    const child = this.children[0];
    console.log(child.evaluate(symbolTable));
    return 0;
  }
}

export class Assignment implements TreeNode<null> {
  value: null;
  children: GenericTreeNode[];

  constructor({ children }: { children: GenericTreeNode[] }) {
    this.value = null;
    this.children = children;
  }

  evaluate(symbolTable: SymbolTable) {
    const [firstChild, secondChild] = this.children;
    if (typeof firstChild.value !== "string") {
      throw new Error("Cannot assign to literal");
    }

    symbolTable.set(firstChild.value, secondChild.evaluate(symbolTable));
    return 0;
  }
}

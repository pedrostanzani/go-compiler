import { TokenType } from "../lib/enums";
import { input } from "../lib/input";
import { isTruthy } from "../lib/utils";
import { SymbolTable } from "./SymbolTable";
import { Token } from "./Token";

type LogicalOperator =
  | TokenType.OR
  | TokenType.AND
  | TokenType.EQUALS
  | TokenType.GREATER_THAN
  | TokenType.LESS_THAN;

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

export class BinOp implements TreeNode<Operator | LogicalOperator> {
  value: Operator | LogicalOperator;
  children: GenericTreeNode[];

  constructor({
    value,
    children,
  }: {
    value: Operator | LogicalOperator;
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

      case TokenType.OR:
        return firstChild.evaluate(symbolTable) ||
          secondChild.evaluate(symbolTable)
          ? 1
          : 0;

      case TokenType.AND:
        return firstChild.evaluate(symbolTable) &&
          secondChild.evaluate(symbolTable)
          ? 1
          : 0;

      case TokenType.EQUALS:
        return firstChild.evaluate(symbolTable) ==
          secondChild.evaluate(symbolTable)
          ? 1
          : 0;

      case TokenType.GREATER_THAN:
        return firstChild.evaluate(symbolTable) >
          secondChild.evaluate(symbolTable)
          ? 1
          : 0;

      case TokenType.LESS_THAN:
        return firstChild.evaluate(symbolTable) <
          secondChild.evaluate(symbolTable)
          ? 1
          : 0;

      default:
        break;
    }

    return 0;
  }
}

export class UnOp
  implements TreeNode<TokenType.PLUS | TokenType.MINUS | TokenType.NOT>
{
  value: TokenType.PLUS | TokenType.MINUS | TokenType.NOT;
  children: GenericTreeNode[];

  constructor({
    value,
    children,
  }: {
    value: TokenType.PLUS | TokenType.MINUS | TokenType.NOT;
    children: GenericTreeNode[];
  }) {
    this.value = value;
    this.children = children;
  }

  evaluate(symbolTable: SymbolTable) {
    const child = this.children[0];

    if (this.value === TokenType.MINUS) {
      return -child.evaluate(symbolTable);
    } else if (this.value === TokenType.PLUS) {
      return child.evaluate(symbolTable);
    } else {
      return !child.evaluate(symbolTable) ? 1 : 0;
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

export class While implements TreeNode<null> {
  value: null;
  children: GenericTreeNode[];

  constructor({ children }: { children: GenericTreeNode[] }) {
    this.value = null;
    this.children = children;
  }

  evaluate(symbolTable: SymbolTable) {
    const [firstChild, secondChild] = this.children;

    while (firstChild.evaluate(symbolTable)) {
      secondChild.evaluate(symbolTable);
    }

    return 0;
  }
}

export class If implements TreeNode<null> {
  value: null;
  children: GenericTreeNode[];

  constructor({ children }: { children: GenericTreeNode[] }) {
    this.value = null;
    this.children = children;
  }

  evaluate(symbolTable: SymbolTable) {
    const [condition, ifBlock, elseBlock] = this.children;

    if (condition.evaluate(symbolTable)) {
      ifBlock.evaluate(symbolTable);
    } else if (isTruthy(elseBlock)) {
      elseBlock.evaluate(symbolTable);
    }

    return 0;
  }
}

export class Scan implements TreeNode<null> {
  value: null;
  children: GenericTreeNode[];

  constructor() {
    this.value = null;
    this.children = [];
  }

  evaluate(symbolTable: SymbolTable) {
    return Number(input());
  }
}

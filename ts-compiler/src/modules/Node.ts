import { TokenType } from "../lib/enums";

type AdditionOrSubtraction = TokenType.PLUS | TokenType.MINUS;
type Operator = AdditionOrSubtraction | TokenType.X | TokenType.DIVIDE;
type Variant = number | Operator;

export interface TreeNode<V> {
  value: V;
  children: TreeNode<Variant>[];
  evaluate: () => number;
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

  evaluate() {
    switch (this.value) {
      case TokenType.PLUS:
        return this.children[0].evaluate() + this.children[1].evaluate();

      case TokenType.MINUS:
        return this.children[0].evaluate() - this.children[1].evaluate();

      case TokenType.DIVIDE:
        return Math.floor(
          this.children[0].evaluate() / this.children[1].evaluate()
        );

      case TokenType.X:
        return this.children[0].evaluate() * this.children[1].evaluate();

      default:
        break;
    }

    return 0;
  }
}

export class UnOp implements TreeNode<AdditionOrSubtraction> {
  value: AdditionOrSubtraction;
  children: GenericTreeNode[];

  constructor({
    value,
    children,
  }: {
    value: AdditionOrSubtraction;
    children: GenericTreeNode[];
  }) {
    this.value = value;
    this.children = children;
  }

  evaluate() {
    if (this.value === TokenType.MINUS) {
      return -this.children[0].evaluate();
    }

    return this.children[0].evaluate();
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

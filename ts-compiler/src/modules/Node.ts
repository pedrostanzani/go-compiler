import { TokenType } from "../lib/enums";
import { Input } from "../lib/input";
import { isTruthy } from "../lib/utils";
import {
  BYTE_SHIFT_INCREMENT,
  InitializedSymbol,
  SymbolTable,
  SymbolType,
} from "./SymbolTable";
import { Token } from "./Token";
import { nodeIdService } from "./NodeIdService";
import { code as codeInstance } from "./Code";

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

type Variant = number | string | boolean | Operator | null;

export interface TreeNode<V> {
  id: number;
  value: V;
  children: TreeNode<Variant>[];
  evaluate: (symbolTable: SymbolTable) => InitializedSymbol;
  generate: (symbolTable: SymbolTable) => void;
}

export type GenericTreeNode = TreeNode<Variant>;

export class BinOp implements TreeNode<Operator | LogicalOperator> {
  id: number;
  value: Operator | LogicalOperator;
  children: GenericTreeNode[];

  constructor({
    value,
    children,
  }: {
    value: Operator | LogicalOperator;
    children: GenericTreeNode[];
  }) {
    this.id = nodeIdService.getId();
    nodeIdService.increment();
    this.value = value;
    this.children = children;
  }

  handleStringOp(
    a: string,
    b: string,
    options: {
      allowComparison: boolean;
      errorMessage?: string;
    } = {
      allowComparison: true,
      errorMessage: `Invalid operation ${this.value} for operands of type string`,
    }
  ) {
    if (this.value === TokenType.PLUS) {
      return {
        type: SymbolType.STRING,
        value: a + b,
      };
    }

    if (!options.allowComparison) {
      throw new Error(options.errorMessage);
    }

    if (this.value === TokenType.LESS_THAN) {
      return {
        type: SymbolType.BOOL,
        value: a < b,
      };
    }

    if (this.value === TokenType.GREATER_THAN) {
      return {
        type: SymbolType.BOOL,
        value: a > b,
      };
    }

    if (this.value === TokenType.EQUALS) {
      return {
        type: SymbolType.BOOL,
        value: a === b,
      };
    }

    throw new Error(options.errorMessage);
  }

  evaluate(symbolTable: SymbolTable) {
    const [firstValue, secondValue] = this.children.map(
      (child) => child.evaluate(symbolTable).value
    );

    if (typeof firstValue === "string" && typeof secondValue === "string") {
      return this.handleStringOp(firstValue, secondValue);
    }

    if (typeof firstValue === "boolean" && typeof secondValue === "string") {
      return this.handleStringOp(String(firstValue), secondValue, {
        allowComparison: false,
        errorMessage: `Invalid operation ${this.value} for operands of type boolean and string`,
      });
    }

    if (typeof firstValue === "string" && typeof secondValue === "boolean") {
      return this.handleStringOp(firstValue, String(secondValue), {
        allowComparison: false,
        errorMessage: `Invalid operation ${this.value} for operands of type boolean and string`,
      });
    }

    if (typeof firstValue === "number" && typeof secondValue === "string") {
      return this.handleStringOp(String(firstValue), secondValue, {
        allowComparison: false,
        errorMessage: `Invalid operation ${this.value} for operands of type number and string`,
      });
    }

    if (typeof firstValue === "string" && typeof secondValue === "number") {
      return this.handleStringOp(firstValue, String(secondValue), {
        allowComparison: false,
        errorMessage: `Invalid operation ${this.value} for operands of type number and string`,
      });
    }

    if (typeof firstValue === "number" && typeof secondValue === "number") {
      switch (this.value) {
        case TokenType.PLUS:
          return {
            type: SymbolType.INT,
            value: firstValue + secondValue,
          };

        case TokenType.MINUS:
          return {
            type: SymbolType.INT,
            value: firstValue - secondValue,
          };

        case TokenType.DIVIDE:
          return {
            type: SymbolType.INT,
            value: Math.floor(firstValue / secondValue),
          };

        case TokenType.X:
          return {
            type: SymbolType.INT,
            value: firstValue * secondValue,
          };

        case TokenType.OR:
          return {
            type: SymbolType.BOOL,
            value: firstValue || secondValue ? true : false,
          };

        case TokenType.AND:
          return {
            type: SymbolType.BOOL,
            value: firstValue && secondValue ? true : false,
          };

        case TokenType.EQUALS:
          return {
            type: SymbolType.BOOL,
            value: firstValue == secondValue ? true : false,
          };

        case TokenType.GREATER_THAN:
          return {
            type: SymbolType.BOOL,
            value: firstValue > secondValue ? true : false,
          };

        case TokenType.LESS_THAN:
          return {
            type: SymbolType.BOOL,
            value: firstValue < secondValue ? true : false,
          };

        default:
          break;
      }
    }

    if (typeof firstValue === "boolean" && typeof secondValue === "boolean") {
      switch (this.value) {
        case TokenType.OR:
          return {
            type: SymbolType.BOOL,
            value: firstValue || secondValue ? true : false,
          };

        case TokenType.AND:
          return {
            type: SymbolType.BOOL,
            value: firstValue && secondValue ? true : false,
          };

        case TokenType.EQUALS:
          return {
            type: SymbolType.BOOL,
            value: firstValue == secondValue ? true : false,
          };

        case TokenType.GREATER_THAN:
          return {
            type: SymbolType.BOOL,
            value: firstValue > secondValue ? true : false,
          };

        case TokenType.LESS_THAN:
          return {
            type: SymbolType.BOOL,
            value: firstValue < secondValue ? true : false,
          };

        default:
          break;
      }
    }

    if (
      (typeof firstValue === "number" && typeof secondValue === "boolean") ||
      (typeof firstValue === "boolean" && typeof secondValue === "number")
    ) {
      throw new Error(
        `Invalid operation ${this.value} for operands of type number and boolean`
      );
    }

    return {
      type: SymbolType.INT,
      value: 0,
    };
  }

  generate(symbolTable: SymbolTable) {
    const [firstChild, secondChild] = this.children;

    if (
      this.value === TokenType.PLUS ||
      this.value === TokenType.MINUS ||
      this.value === TokenType.DIVIDE ||
      this.value === TokenType.X
    ) {
      secondChild.generate(symbolTable);
      codeInstance.append(`push eax ;`);

      firstChild.generate(symbolTable);
      codeInstance.append(`pop ecx ;`);

      switch (this.value) {
        case TokenType.PLUS:
          codeInstance.append(`add eax, ecx ;`);
          return;

        case TokenType.MINUS:
          codeInstance.append(`sub eax, ecx ;`);
          return;

        case TokenType.DIVIDE:
          codeInstance.append(`cdq           ;`);
          codeInstance.append(`idiv  ecx     ;`);
          return;

        case TokenType.X:
          codeInstance.append(`imul  ecx     ;`);
          return;
      }
    } else {
      secondChild.generate(symbolTable);
      codeInstance.append(`push eax ;`);

      firstChild.generate(symbolTable);
      codeInstance.append(`pop ecx ;`);

      switch (this.value) {
        case TokenType.EQUALS:
          codeInstance.append(`cmp eax, ecx ;`);
          codeInstance.append(`mov ecx, 1   ;`);
          codeInstance.append(`mov eax, 0   ;`);
          codeInstance.append(`cmove eax, ecx ;`);
          return;

        case TokenType.GREATER_THAN:
          codeInstance.append(`cmp eax, ecx ;`);
          codeInstance.append(`mov ecx, 1   ;`);
          codeInstance.append(`mov eax, 0   ;`);
          codeInstance.append(`cmovg eax, ecx ;`);
          return;

        case TokenType.LESS_THAN:
          codeInstance.append(`cmp eax, ecx ;`);
          codeInstance.append(`mov ecx, 1   ;`);
          codeInstance.append(`mov eax, 0   ;`);
          codeInstance.append(`cmovl eax, ecx ;`);
          return;

        case TokenType.OR:
          codeInstance.append(`or eax, ecx ;`);
          return;

        case TokenType.AND:
          codeInstance.append(`and eax, ecx ;`);
          return;
      }
    }
  }
}

export class UnOp
  implements TreeNode<TokenType.PLUS | TokenType.MINUS | TokenType.NOT>
{
  id: number;
  value: TokenType.PLUS | TokenType.MINUS | TokenType.NOT;
  children: GenericTreeNode[];

  constructor({
    value,
    children,
  }: {
    value: TokenType.PLUS | TokenType.MINUS | TokenType.NOT;
    children: GenericTreeNode[];
  }) {
    this.id = nodeIdService.getId();
    nodeIdService.increment();
    this.value = value;
    this.children = children;
  }

  evaluate(symbolTable: SymbolTable) {
    const child = this.children[0];

    if (this.value === TokenType.MINUS) {
      const childEval = child.evaluate(symbolTable);
      return {
        ...childEval,
        value: -childEval.value,
      };
    } else if (this.value === TokenType.PLUS) {
      return child.evaluate(symbolTable);
    } else {
      const symbol = child.evaluate(symbolTable);

      if (symbol.type === SymbolType.INT) {
        throw new Error(
          `Invalid operation ${this.value} for operand of type number`
        );
      }

      return !symbol.value
        ? {
            type: SymbolType.BOOL,
            value: true,
          }
        : {
            type: SymbolType.BOOL,
            value: false,
          };
    }
  }

  generate(symbolTable: SymbolTable) {
    const child = this.children[0];

    if (this.value === TokenType.MINUS) {
      child.generate(symbolTable);
      codeInstance.append(`neg eax;`);
    } else if (this.value === TokenType.PLUS) {
      child.generate(symbolTable);
    } else {
      child.generate(symbolTable);
      codeInstance.append(`test eax, eax;`);
      codeInstance.append(`setz al;`);
      codeInstance.append(`movzx eax, al;`);
    }
  }
}

export class IntVal implements TreeNode<number> {
  id: number;
  value: number;
  children: TreeNode<never>[];

  constructor({
    value,
    children,
  }: {
    value: number;
    children: TreeNode<never>[];
  }) {
    this.id = nodeIdService.getId();
    nodeIdService.increment();
    this.value = value;
    this.children = children;
  }

  evaluate() {
    return {
      type: SymbolType.INT,
      value: this.value,
    };
  }

  generate() {
    codeInstance.append(`mov eax, ${this.value} ;`);
  }
}

export class StringVal implements TreeNode<string> {
  id: number;
  value: string;
  children: TreeNode<never>[];

  constructor({ value }: { value: string }) {
    this.id = nodeIdService.getId();
    nodeIdService.increment();
    this.value = value;
    this.children = [];
  }

  evaluate() {
    return {
      type: SymbolType.STRING,
      value: this.value,
    };
  }

  generate() {}
}

export class BoolVal implements TreeNode<boolean> {
  id: number;
  value: boolean;
  children: TreeNode<never>[];

  constructor({ value }: { value: boolean }) {
    this.id = nodeIdService.getId();
    nodeIdService.increment();
    this.value = value;
    this.children = [];
  }

  evaluate() {
    return {
      type: SymbolType.BOOL,
      value: this.value,
    };
  }

  generate() {
    codeInstance.append(`mov eax, ${this.value ? "1" : "0"} ;`);
  }
}

export class NoOp implements TreeNode<null> {
  id: number;
  value: null;
  children: TreeNode<never>[];

  constructor() {
    this.id = nodeIdService.getId();
    nodeIdService.increment();
    this.value = null;
    this.children = [];
  }

  evaluate() {
    return {
      type: SymbolType.INT,
      value: this.value ?? 0,
    };
  }

  generate() {}
}

export class Identifier implements TreeNode<string> {
  id: number;
  value: string;
  children: TreeNode<never>[];

  constructor({ token }: { token: Token }) {
    if (token.getType() !== TokenType.IDENTIFIER) {
      throw new Error("Expected identifier token.");
    }

    this.id = nodeIdService.getId();
    nodeIdService.increment();
    this.value = token.getStringValue();
    this.children = [];
  }

  evaluate(symbolTable: SymbolTable) {
    const symbol = symbolTable.get(this.value);

    if (symbol.value === null) {
      throw new Error(`Cannot evaluate uninitialized symbol ${this.value}`);
    }

    return {
      type: symbol.type,
      value: symbol.value,
    };
  }

  generate() {}
}

export class Block implements TreeNode<null> {
  id: number;
  value: null;
  children: GenericTreeNode[];

  constructor({ children }: { children: GenericTreeNode[] }) {
    this.id = nodeIdService.getId();
    nodeIdService.increment();
    this.value = null;
    this.children = children;
  }

  evaluate(symbolTable: SymbolTable) {
    this.children.forEach((child) => {
      child.evaluate(symbolTable);
    });

    return {
      type: SymbolType.INT,
      value: 0,
    };
  }

  generate(symbolTable: SymbolTable) {
    this.children.forEach((child) => {
      child.generate(symbolTable);
    });
  }
}

export class Print implements TreeNode<null> {
  id: number;
  value: null;
  children: GenericTreeNode[];

  constructor({ children }: { children: GenericTreeNode[] }) {
    this.id = nodeIdService.getId();
    nodeIdService.increment();
    this.value = null;
    this.children = children;
  }

  evaluate(symbolTable: SymbolTable) {
    const child = this.children[0];
    // console.log("--->", symbolTable)
    console.log(child.evaluate(symbolTable).value);
    return {
      type: SymbolType.INT,
      value: 0,
    };
  }

  generate(symbolTable: SymbolTable): void {
    const expr = this.children[0];

    expr.generate(symbolTable);
    codeInstance.append(`push eax ;`);
    codeInstance.append(`push format_out ;`);
    codeInstance.append(`call printf ;`);
    codeInstance.append(`add esp, 8 ;`);
  }
}

export class Assignment implements TreeNode<null> {
  id: number;
  value: null;
  children: GenericTreeNode[];

  constructor({ children }: { children: GenericTreeNode[] }) {
    this.id = nodeIdService.getId();
    nodeIdService.increment();
    this.value = null;
    this.children = children;
  }

  evaluate(symbolTable: SymbolTable) {
    const [firstChild, secondChild] = this.children;
    if (typeof firstChild.value !== "string") {
      throw new Error("Cannot assign to literal");
    }

    const secondChildSymbol = secondChild.evaluate(symbolTable);
    symbolTable.setSymbol(firstChild.value, secondChildSymbol);

    return {
      type: SymbolType.INT,
      value: 0,
    };
  }

  generate(symbolTable: SymbolTable) {
    const [firstChild, secondChild] = this.children;
    if (typeof firstChild.value !== "string") {
      throw new Error("Cannot assign to literal");
    }

    secondChild.generate(symbolTable);

    const sym = symbolTable.get(firstChild.value);
    if (sym.offset == null) {
      throw new Error(`No offset recorded for variable '${firstChild.value}'`);
    }

    // 4) emit the store instruction
    codeInstance.append(`mov [ebp-${sym.offset}], eax ;`);
  }
}

export class VarDec implements TreeNode<SymbolType> {
  id: number;
  value: SymbolType;
  children: GenericTreeNode[];

  constructor({
    children,
    value,
  }: {
    children: GenericTreeNode[];
    value: SymbolType;
  }) {
    this.id = nodeIdService.getId();
    nodeIdService.increment();
    this.value = value;
    this.children = children;
  }

  evaluate(symbolTable: SymbolTable) {
    if (this.children.length === 1) {
      const child = this.children[0];
      if (typeof child.value !== "string") {
        throw new Error("Cannot assign to literal");
      }

      symbolTable.declare(child.value, this.value);
    } else {
      const [firstChild, secondChild] = this.children;
      if (typeof firstChild.value !== "string") {
        throw new Error("Cannot assign to literal");
      }

      const secondChildSymbol = secondChild.evaluate(symbolTable);
      if (secondChildSymbol.type !== this.value) {
        throw new Error(
          `Cannot assign ${secondChildSymbol.type} to ${this.value} variable`
        );
      }

      symbolTable.declare(firstChild.value, secondChildSymbol.type);
      symbolTable.setSymbol(firstChild.value, secondChildSymbol);
    }

    return {
      type: SymbolType.INT,
      value: 0,
    };
  }

  generate(symbolTable: SymbolTable) {
    const idNode = this.children[0];
    if (typeof idNode.value !== "string") {
      throw new Error("Cannot declare a non-identifier");
    }

    symbolTable.declare(idNode.value, this.value);
    codeInstance.append(`sub esp, ${BYTE_SHIFT_INCREMENT} ;`);

    if (this.children.length === 2) {
      const initExpr = this.children[1];
      initExpr.generate(symbolTable);

      const sym = symbolTable.get(idNode.value);
      if (sym.offset == null) {
        throw new Error(`No offset for variable '${this.value}'`);
      }

      codeInstance.append(`mov [ebp-${sym.offset}], eax ;`);
    }
  }
}

export class While implements TreeNode<null> {
  id: number;
  value: null;
  children: GenericTreeNode[];

  constructor({ children }: { children: GenericTreeNode[] }) {
    this.id = nodeIdService.getId();
    nodeIdService.increment();
    this.value = null;
    this.children = children;
  }

  evaluateAndCheckIfBoolean(node: GenericTreeNode, symbolTable: SymbolTable) {
    const conditionSymbol = node.evaluate(symbolTable);
    if (conditionSymbol.type !== SymbolType.BOOL) {
      throw new Error(
        `Cannot compute condition with type ${conditionSymbol.type}`
      );
    }

    return conditionSymbol.value as boolean;
  }

  evaluate(symbolTable: SymbolTable) {
    const [firstChild, secondChild] = this.children;

    while (this.evaluateAndCheckIfBoolean(firstChild, symbolTable)) {
      secondChild.evaluate(symbolTable);
    }

    return {
      type: SymbolType.INT,
      value: 0,
    };
  }

  generate(symbolTable: SymbolTable): void {
    const [firstChild, secondChild] = this.children;

    const loopLabel = `loop_${this.id}`;
    const exitLabel = `exit_${this.id}`;

    codeInstance.append(`${loopLabel}:`);
    firstChild.generate(symbolTable);
    codeInstance.append(`cmp eax, 0 ;`);
    codeInstance.append(`je  ${exitLabel} ;`);
    secondChild.generate(symbolTable);
    codeInstance.append(`jmp ${loopLabel} ;`);
    codeInstance.append(`${exitLabel}:`);
  }
}

export class If implements TreeNode<null> {
  id: number;
  value: null;
  children: GenericTreeNode[];

  constructor({ children }: { children: GenericTreeNode[] }) {
    this.id = nodeIdService.getId();
    nodeIdService.increment();
    this.value = null;
    this.children = children;
  }

  evaluate(symbolTable: SymbolTable) {
    const [condition, ifBlock, elseBlock] = this.children;

    const conditionSymbol = condition.evaluate(symbolTable);
    if (conditionSymbol.type !== SymbolType.BOOL) {
      throw new Error(
        `Cannot compute condition with type ${conditionSymbol.type}`
      );
    }

    if (conditionSymbol.value) {
      ifBlock.evaluate(symbolTable);
    } else if (isTruthy(elseBlock)) {
      elseBlock.evaluate(symbolTable);
    }

    return {
      type: SymbolType.INT,
      value: 0,
    };
  }

  generate(symbolTable: SymbolTable): void {
    const [condition, ifBlock, elseBlock] = this.children;

    const elseLabel = `else_${this.id}`;
    const exitLabel = `exit_${this.id}`;

    condition.generate(symbolTable);
    codeInstance.append(`cmp eax, 0 ;`);
    if (isTruthy(elseBlock)) {
      codeInstance.append(`je  ${elseLabel} ;`);
    } else {
      codeInstance.append(`je  ${exitLabel} ;`);
    }

    ifBlock.generate(symbolTable);
    codeInstance.append(`jmp ${exitLabel} ;`);

    if (isTruthy(elseBlock)) {
      codeInstance.append(`${elseLabel}:`);
      elseBlock.generate(symbolTable);
    }

    codeInstance.append(`${exitLabel}:`);
  }
}

export class Scan implements TreeNode<null> {
  private static input: Input = new Input("syncprompt");

  id: number;
  value: null;
  children: GenericTreeNode[];

  constructor() {
    this.id = nodeIdService.getId();
    nodeIdService.increment();
    this.value = null;
    this.children = [];
  }

  evaluate(_: SymbolTable) {
    return {
      type: SymbolType.INT,
      value: Number(Scan.input.get()),
    };
  }

  generate(): void {
    codeInstance.append(`push scan_int ;`);
    codeInstance.append(`push format_in ;`);
    codeInstance.append(`call scanf ;`);
    codeInstance.append(`add esp, 8 ;`);
    codeInstance.append(`mov eax, dword [scan_int] ;`);
  }
}

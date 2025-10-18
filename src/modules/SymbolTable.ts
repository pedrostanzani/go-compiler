import { isTruthy } from "../lib/utils";
import { FuncDec } from "./Node";

export enum SymbolType {
  STRING = "STRING",
  INT = "INT",
  BOOL = "BOOL",
  FUNC = "FUNC",
}

export type ValidFunctionReturnType = Exclude<SymbolType, SymbolType.FUNC>;

type FunctionSymbol = {
  declaration: FuncDec;
  returnType: ValidFunctionReturnType | null;
};

export type SymbolValue = string | number | boolean | FunctionSymbol;

interface BaseSymbol {
  type: SymbolType;
  value: SymbolValue | null;
  explicit?: boolean;
}
export interface InitializedSymbol extends BaseSymbol {
  value: SymbolValue;
}
export type Symbol = BaseSymbol | InitializedSymbol;

export class SymbolTable {
  private table: Map<string, Symbol>;
  public parent: SymbolTable | null;

  constructor(parent: SymbolTable | null = null) {
    this.table = new Map();
    this.parent = parent;
  }

  get(key: string): Symbol {
    const symbol = this.table.get(key);
    if (isTruthy(symbol)) return symbol;
    if (isTruthy(this.parent)) return this.parent.get(key);
    throw new Error(`Name error: identifier '${key}' is not defined`);
  }

  setSymbol(key: string, symbol: Symbol): void {
    if (this.table.has(key)) {
      const current = this.table.get(key)!;
      if (symbol.type !== current.type) {
        throw new Error(
          `Cannot set ${symbol.type} to variable declared as ${current.type}`
        );
      }
      this.table.set(key, symbol);
      return;
    }

    if (this.parent) {
      this.parent.setSymbol(key, symbol);
      return;
    }

    throw new Error(`Variable ${key} does not exist in context`);
  }

  declare(key: string, type: SymbolType) {
    if (this.table.has(key)) {
      throw new Error(`Variable ${key} has already been declared`);
    }

    this.table.set(key, {
      type: type,
      value: null,
    });
  }
}

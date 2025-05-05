import { isTruthy } from "../lib/utils";

export const BYTE_SHIFT_INCREMENT = 4;

export enum SymbolType {
  STRING = "STRING",
  INT = "INT",
  BOOL = "BOOL",
}

type SymbolValue = string | number | boolean;

interface BaseSymbol { type: SymbolType; value: SymbolValue | null, offset?: number }
export interface InitializedSymbol extends BaseSymbol { value: SymbolValue };
export type Symbol = BaseSymbol | InitializedSymbol;

export class SymbolTable {
  private table: Map<string, Symbol>;
  private currentOffset: number = 0;

  constructor() {
    this.table = new Map();
  }

  get(key: string): Symbol {
    const symbol = this.table.get(key);
    if (isTruthy(symbol)) return symbol;
    throw new Error(`Name error: identifier '${key}' is not defined`);
  }

  setSymbol(key: string, symbol: Symbol): void {
    const currentSymbol = this.table.get(key);
    if (!isTruthy(currentSymbol)) {
      throw new Error(`Variable ${key} does not exist in context`);
    }

    if (symbol.type !== currentSymbol.type) {
      throw new Error(
        `Cannot set ${symbol.type} to variable declared as ${currentSymbol.type}`
      );
    }

    this.table.set(key, symbol);
  }

  declare(key: string, type: SymbolType) {
    if (this.table.has(key)) {
      throw new Error(`Variable ${key} has already been declared`);
    }

    this.currentOffset += BYTE_SHIFT_INCREMENT;

    this.table.set(key, {
      type: type,
      value: null,
      offset: this.currentOffset,
    });
  }
}

export class SymbolTable {
  private table: Map<string, number>;

  constructor() {
    this.table = new Map();
  }

  set(key: string, value: number) {
    this.table.set(key, value);
  }

  get(key: string) {
    const value = this.table.get(key);
    if (typeof value === "number") {
      return value;
    }

    throw new Error(`Name error: identifier '${key}' is not defined`);
  }
}


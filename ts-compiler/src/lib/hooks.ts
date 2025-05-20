import { SymbolType, SymbolValue } from "../modules/SymbolTable";

class OnReturn extends Error {
  public value: SymbolValue;
  public type: SymbolType;
  public explicit: boolean = false;

  constructor(
    value: SymbolValue,
    type: SymbolType,
    explicit: boolean = false
  ) {
    super();
    this.value = value;
    this.type = type;
    this.explicit = explicit;
  }
}

export { OnReturn };

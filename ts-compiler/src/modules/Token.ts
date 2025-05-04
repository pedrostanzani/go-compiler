import { TokenType } from "../lib/enums";

export class Token {
  type: TokenType;
  value: number | string | boolean | null;

  constructor({
    type,
    value = null,
  }: {
    type: TokenType;
    value?: number | string | boolean | null;
  }) {
    this.type = type;
    this.value = value;
  }

  getType() {
    return this.type;
  }

  getNumericValue(): number {
    if (typeof this.value === "number") {
      return this.value;
    }

    return 0;
  }

  getStringValue(): string {
    if (typeof this.value === "string") {
      return this.value;
    }

    return "";
  }

  getBooleanValue(): boolean {
    if (typeof this.value === "boolean") {
      return this.value;
    }

    return false;
  }

  getValue() {
    return this.value;
  }

  getRepr() {
    return JSON.stringify({
      type: this.type,
      value: this.value,
    });
  }
}

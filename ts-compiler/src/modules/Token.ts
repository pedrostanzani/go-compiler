import { TokenType } from "../lib/enums";

export class Token {
  type: TokenType;
  value: number;

  constructor({ type, value }: { type: TokenType; value: number }) {
    this.type = type;
    this.value = value;
  }

  getType() {
    return this.type;
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

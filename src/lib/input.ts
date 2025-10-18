type InputAPI = "syncprompt" | "readline-sync";

export class Input {
  private api: InputAPI;

  constructor(api: InputAPI = "readline-sync") {
    this.api = api;
  }

  get(message: string = ""): string {
    if (this.api === "readline-sync") {
      const readlineSync = require("readline-sync") as typeof import("readline-sync");
      return readlineSync.question(message);
    } else {
      // @ts-ignore
      const prompt = require("syncprompt") as (msg: string) => string;
      return prompt(message);
    }
  }
}

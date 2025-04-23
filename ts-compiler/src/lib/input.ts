import readlineSync from "readline-sync";

export function input(prompt: string = ""): string {
  return readlineSync.question(prompt);
}

// @ts-ignore
import prompt from "syncprompt";

export function input(message: string = ""): string {
  return prompt(message);
}

export class PrePro {
  static filter(sourceCode: string) {
    return sourceCode
      .replace(/\/\/.*$/gm, "")
      .split("\n")
      .filter((line) => line.trim() !== "")
      .join("\n");
  }
}

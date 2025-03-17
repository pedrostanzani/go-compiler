export class PrePro {
  static filter(sourceCode: string) {
    return sourceCode.replace(/\/\/.*$/gm, '');
  }
}

export class Debug {
  private static debug = false;

  static log(...args: unknown[]) {
    if (Debug.debug) {
      console.log(...args);
    }
  }
}

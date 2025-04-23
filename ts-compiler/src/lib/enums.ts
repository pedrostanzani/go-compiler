export enum TokenType {
  // Numerical
  INT = "INT",

  // Operations
  PLUS = "PLUS",
  MINUS = "MINUS",
  X = "X",
  DIVIDE = "DIVIDE",

  // Brackets
  OPEN_PAR = "OPEN_PAR",
  CLOSE_PAR = "CLOSE_PAR",

  // Blocks
  OPEN_BRAC = "OPEN_BRAC",
  CLOSE_BRAC = "CLOSE_BRAC",

  // Assignment
  ASSIGNMENT = "ASSIGNMENT",
  IDENTIFIER = "IDENTIFIER",

  // Built-ins
  PRINTLN = "PRINTLN",

  // New line
  NEW_LINE = "NEW_LINE",

  // EOF
  EOF = "EOF",
}

export enum TokenRepresentation {
  // Operations
  PLUS = "+",
  MINUS = "-",
  X = "*",
  DIVIDE = "/",

  // Brackets
  OPEN_PAR = "(",
  CLOSE_PAR = ")",

  // Blocks
  OPEN_BRAC = "{",
  CLOSE_BRAC = "}",

  // Assignment
  ASSIGNMENT = "=",

  // Built-ins
  PRINT = "Println",

  // New line
  NEW_LINE = "\n",
}

export enum TokenType {
  // Numerical
  INT = "INT",

  // Operations
  PLUS = "PLUS",
  MINUS = "MINUS",
  X = "X",
  DIVIDE = "DIVIDE",

  // Brackets
  OPEN_PAR = 'OPEN_PAR',
  CLOSE_PAR = 'CLOSE_PAR',

  // EOF
  EOF = "EOF"
}

export enum TokenRepresentation {
  // Operations
  PLUS = "+",
  MINUS = "-",
  X = "*",
  DIVIDE = "/",

  // Brackets
  OPEN_PAR = "(",
  CLOSE_PAR = ")"
}

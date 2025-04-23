
export enum TokenType {
  // Numerical
  INT = "INT",

  // Operations
  PLUS = "PLUS",
  MINUS = "MINUS",
  X = "X",
  DIVIDE = "DIVIDE",

  // Boolean operators
  NOT = "NOT",
  AND = "AND",
  OR = "OR",

  // Comparison operators
  EQUALS = "EQUALS",
  GREATER_THAN = "GREATER_THAN",
  LESS_THAN = "LESS_THAN",

  // Brackets
  OPEN_PAR = "OPEN_PAR",
  CLOSE_PAR = "CLOSE_PAR",

  // Blocks
  OPEN_BRAC = "OPEN_BRAC",
  CLOSE_BRAC = "CLOSE_BRAC",

  // Assignment
  ASSIGNMENT = "ASSIGNMENT",
  IDENTIFIER = "IDENTIFIER",

  // Conditional statements
  IF = "IF",
  ELSE = "ELSE",
  WHILE = "WHILE",

  // Built-ins
  PRINTLN = "PRINTLN",
  READ = "READ",

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

  // Boolean operators
  NOT = "!",
  AND = "&&",
  OR = "||",

  // Comparison operators
  EQUALS = "==",
  GREATER_THAN = ">",
  LESS_THAN = "<",

  // Brackets
  OPEN_PAR = "(",
  CLOSE_PAR = ")",

  // Blocks
  OPEN_BRAC = "{",
  CLOSE_BRAC = "}",

  // Assignment
  ASSIGNMENT = "=",

  // Conditional statements
  IF = "if",
  ELSE = "else",
  WHILE = "for",

  // Built-ins
  PRINT = "Println",
  READ = "Scan",

  // New line
  NEW_LINE = "\n",
}

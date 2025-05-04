
export enum TokenType {
  // Primitives
  INT = "INT",
  STRING = "STRING",
  BOOL = "BOOL",

  // Type declarations
  VAR = "VAR",
  TYPE = "TYPE",

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

  // Boolean primitives
  TRUE = "true",
  FALSE = "false",

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

  // Quotes
  QUOTE = "\"",

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
  VAR = "var",

  // Types
  INT = "int",
  STR = "string",
  BOOL = "bool",

  // New line
  NEW_LINE = "\n",
}

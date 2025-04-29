"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenRepresentation = exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    // Primitives
    TokenType["INT"] = "INT";
    TokenType["STRING"] = "STRING";
    TokenType["BOOL"] = "BOOL";
    // Type declarations
    TokenType["VAR"] = "VAR";
    TokenType["TYPE"] = "TYPE";
    // Operations
    TokenType["PLUS"] = "PLUS";
    TokenType["MINUS"] = "MINUS";
    TokenType["X"] = "X";
    TokenType["DIVIDE"] = "DIVIDE";
    // Boolean operators
    TokenType["NOT"] = "NOT";
    TokenType["AND"] = "AND";
    TokenType["OR"] = "OR";
    // Comparison operators
    TokenType["EQUALS"] = "EQUALS";
    TokenType["GREATER_THAN"] = "GREATER_THAN";
    TokenType["LESS_THAN"] = "LESS_THAN";
    // Brackets
    TokenType["OPEN_PAR"] = "OPEN_PAR";
    TokenType["CLOSE_PAR"] = "CLOSE_PAR";
    // Blocks
    TokenType["OPEN_BRAC"] = "OPEN_BRAC";
    TokenType["CLOSE_BRAC"] = "CLOSE_BRAC";
    // Assignment
    TokenType["ASSIGNMENT"] = "ASSIGNMENT";
    TokenType["IDENTIFIER"] = "IDENTIFIER";
    // Conditional statements
    TokenType["IF"] = "IF";
    TokenType["ELSE"] = "ELSE";
    TokenType["WHILE"] = "WHILE";
    // Built-ins
    TokenType["PRINTLN"] = "PRINTLN";
    TokenType["READ"] = "READ";
    // New line
    TokenType["NEW_LINE"] = "NEW_LINE";
    // EOF
    TokenType["EOF"] = "EOF";
})(TokenType || (exports.TokenType = TokenType = {}));
var TokenRepresentation;
(function (TokenRepresentation) {
    // Operations
    TokenRepresentation["PLUS"] = "+";
    TokenRepresentation["MINUS"] = "-";
    TokenRepresentation["X"] = "*";
    TokenRepresentation["DIVIDE"] = "/";
    // Boolean primitives
    TokenRepresentation["TRUE"] = "true";
    TokenRepresentation["FALSE"] = "false";
    // Boolean operators
    TokenRepresentation["NOT"] = "!";
    TokenRepresentation["AND"] = "&&";
    TokenRepresentation["OR"] = "||";
    // Comparison operators
    TokenRepresentation["EQUALS"] = "==";
    TokenRepresentation["GREATER_THAN"] = ">";
    TokenRepresentation["LESS_THAN"] = "<";
    // Brackets
    TokenRepresentation["OPEN_PAR"] = "(";
    TokenRepresentation["CLOSE_PAR"] = ")";
    // Quotes
    TokenRepresentation["QUOTE"] = "\"";
    // Blocks
    TokenRepresentation["OPEN_BRAC"] = "{";
    TokenRepresentation["CLOSE_BRAC"] = "}";
    // Assignment
    TokenRepresentation["ASSIGNMENT"] = "=";
    // Conditional statements
    TokenRepresentation["IF"] = "if";
    TokenRepresentation["ELSE"] = "else";
    TokenRepresentation["WHILE"] = "for";
    // Built-ins
    TokenRepresentation["PRINT"] = "Println";
    TokenRepresentation["READ"] = "Scan";
    TokenRepresentation["VAR"] = "var";
    // Types
    TokenRepresentation["INT"] = "int";
    TokenRepresentation["STR"] = "str";
    TokenRepresentation["BOOL"] = "bool";
    // New line
    TokenRepresentation["NEW_LINE"] = "\n";
})(TokenRepresentation || (exports.TokenRepresentation = TokenRepresentation = {}));

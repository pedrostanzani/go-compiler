"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenRepresentation = exports.TokenType = void 0;
var TokenType;
(function (TokenType) {
    // Numerical
    TokenType["INT"] = "INT";
    // Operations
    TokenType["PLUS"] = "PLUS";
    TokenType["MINUS"] = "MINUS";
    TokenType["X"] = "X";
    TokenType["DIVIDE"] = "DIVIDE";
    // Brackets
    TokenType["OPEN_PAR"] = "OPEN_PAR";
    TokenType["CLOSE_PAR"] = "CLOSE_PAR";
    // Blocks
    TokenType["OPEN_BRAC"] = "OPEN_BRAC";
    TokenType["CLOSE_BRAC"] = "CLOSE_BRAC";
    // Assignment
    TokenType["ASSIGNMENT"] = "ASSIGNMENT";
    TokenType["IDENTIFIER"] = "IDENTIFIER";
    // Built-ins
    TokenType["PRINTLN"] = "PRINTLN";
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
    // Brackets
    TokenRepresentation["OPEN_PAR"] = "(";
    TokenRepresentation["CLOSE_PAR"] = ")";
    // Blocks
    TokenRepresentation["OPEN_BRAC"] = "{";
    TokenRepresentation["CLOSE_BRAC"] = "}";
    // Assignment
    TokenRepresentation["ASSIGNMENT"] = "=";
    // Built-ins
    TokenRepresentation["PRINT"] = "Println";
    // New line
    TokenRepresentation["NEW_LINE"] = "\n";
})(TokenRepresentation || (exports.TokenRepresentation = TokenRepresentation = {}));

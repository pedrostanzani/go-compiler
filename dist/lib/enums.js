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
})(TokenRepresentation || (exports.TokenRepresentation = TokenRepresentation = {}));

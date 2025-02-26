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
    // EOF
    TokenType["EOF"] = "EOF";
})(TokenType || (exports.TokenType = TokenType = {}));
var TokenRepresentation;
(function (TokenRepresentation) {
    TokenRepresentation["PLUS"] = "+";
    TokenRepresentation["MINUS"] = "-";
    TokenRepresentation["X"] = "*";
    TokenRepresentation["DIVIDE"] = "/";
})(TokenRepresentation || (exports.TokenRepresentation = TokenRepresentation = {}));

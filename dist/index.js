"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const Parser_1 = require("./modules/Parser");
const SymbolTable_1 = require("./modules/SymbolTable");
const main = () => {
    const argument = process.argv[2];
    if (argument === undefined) {
        throw new Error("Argument not defined.");
    }
    let sourceCode = "";
    if (argument.endsWith(".go")) {
        try {
            sourceCode = (0, fs_1.readFileSync)(argument, "utf8");
        }
        catch (error) {
            console.error(error);
            throw new Error("Failed to read file");
        }
    }
    else {
        sourceCode = argument;
    }
    const ast = Parser_1.Parser.run(sourceCode);
    const symbolTable = new SymbolTable_1.SymbolTable();
    ast.evaluate(symbolTable);
};
main();

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const Parser_1 = require("./modules/Parser");
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
            throw new Error("Failed to read file");
        }
    }
    else {
        sourceCode = argument;
    }
    const result = Parser_1.Parser.run(sourceCode);
    console.log(result.evaluate());
};
main();

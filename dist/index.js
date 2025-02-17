"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Parser_1 = require("./modules/Parser");
const main = () => {
    const argument = process.argv[2];
    if (argument === undefined) {
        throw new Error();
    }
    const result = Parser_1.Parser.run(argument);
    console.log(result);
};
main();

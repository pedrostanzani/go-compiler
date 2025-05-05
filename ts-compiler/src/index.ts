import { readFileSync } from "fs";
import { Parser } from "./modules/Parser";
import { SymbolTable } from "./modules/SymbolTable";
import { code as codeInstance } from "./modules/Code";

const main = () => {
  const argument = process.argv[2];
  if (argument === undefined) {
    throw new Error("Argument not defined.");
  }

  let sourceCode: string = "";

  if (argument.endsWith(".go")) {
    try {
      sourceCode = readFileSync(argument, "utf8");
    } catch (error) {
      console.error(error)
      throw new Error("Failed to read file");
    }
  } else {
    sourceCode = argument;
  }

  const ast = Parser.run(sourceCode);
  const symbolTable = new SymbolTable();
  ast.generate(symbolTable);
  codeInstance.dump(`${argument.replace(".go", "")}.asm`);
};

main();

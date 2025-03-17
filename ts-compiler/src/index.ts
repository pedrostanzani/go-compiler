import { readFileSync } from "fs";
import { Parser } from "./modules/Parser";

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
      throw new Error("Failed to read file");
    }
  } else {
    sourceCode = argument;
  }

  const result = Parser.run(sourceCode);
  console.log(result.evaluate());
};

main();

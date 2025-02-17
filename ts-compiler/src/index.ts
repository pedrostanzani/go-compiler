import { Parser } from "./modules/Parser"

const main = () => {
  const argument = process.argv[2];
  if (argument === undefined) {
    throw new Error();
  }
  const result = Parser.run(argument);
  console.log(result)
}

main();

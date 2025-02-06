type Operator = "+" | "-";

const EOF = '\0'
const OPERATORS: readonly string[] = ["+", "-"];
const DIGITS = Array.from(String(1234567890));

const isOperator = (char: string): char is Operator => {
  return OPERATORS.includes(char)
}

const isDigit = (char: string) => {
  return DIGITS.includes(char);
}

const toNumberOrThrow = (s: string) => {
  if (s === '') {
    throw new Error("Could not convert empty string to number")
  }

  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    if (!isDigit(char)) {
      throw new Error(`Could not convert '${s}' to number`)
    }
    
  }

  return Number(s)
}

const parseOperands = (first: unknown, second: unknown): number[] => {
  if (typeof first !== 'number' || typeof second !== 'number') {
    throw new Error("Error parsing operands")
  }

  return [first, second]
}


const parseArgument = (argument: string): number => {
  const strippedArgument = argument.replace(/\s+/g, '')

  let scan = '';
  let tokens: (number | Operator)[] = [];

  [ ...Array.from(strippedArgument), EOF].forEach((char) => {
    if (char === EOF) {
      const operand = toNumberOrThrow(scan);
      tokens.push(operand)
      return;
    }

    if (isOperator(char)) {
      const operand = toNumberOrThrow(scan);
      tokens.push(operand)
      scan = '';
      tokens.push(char)
      return;
    }

    if (isDigit(char)) {
      scan += char;
      return;
    }

    throw new Error(`Failed to parse character ${char}`)
  });

  while (tokens.length > 1) {
    if (tokens.length < 3) {
      throw new Error("Inconsistent lenght")
    }
    
    const firstOperand = tokens[0];
    const operator = tokens[1];
    const secondOperand = tokens[2];

    const [parsedFirstOperand, parsedSecondOperand] = parseOperands(firstOperand, secondOperand)

    let result = null;
    if (operator === '+') {
      result = parsedFirstOperand + parsedSecondOperand
    } else if (operator === "-") {
      result = parsedFirstOperand - parsedSecondOperand
    } else {
      throw new Error("Inconsistent tokenization")
    }

    tokens = [result, ...tokens.slice(3)]
  }

  if (tokens.length === 0) {
    throw new Error("Inconsistent tokenization")
  }

  const result = tokens[0];
  if (typeof result !== 'number') {
    throw new Error("Inconsistent tokenization")
  }

  return result;
};

const main = () => {
  const argument = process.argv[2];
  if (argument === undefined) {
    throw new Error();
  }

  const result = parseArgument(argument);
  console.log(result);
};

main();

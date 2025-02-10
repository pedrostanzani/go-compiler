"use strict";
const EOF = '\0';
const OPERATORS = ["+", "-"];
const DIGITS = Array.from(String(1234567890));
const isWhitespace = (char) => {
    return /\s/.test(char);
};
const isOperator = (char) => {
    return OPERATORS.includes(char);
};
const isDigit = (char) => {
    return DIGITS.includes(char);
};
const toNumberOrThrow = (s) => {
    if (s === '') {
        throw new Error("Could not convert empty string to number");
    }
    for (let i = 0; i < s.length; i++) {
        const char = s[i];
        if (!isDigit(char)) {
            throw new Error(`Could not convert '${s}' to number`);
        }
    }
    return Number(s);
};
const parseOperands = (first, second) => {
    if (typeof first !== 'number' || typeof second !== 'number') {
        throw new Error("Error parsing operands");
    }
    return [first, second];
};
const parseArgument = (argument) => {
    const trimmedArgument = argument.trim();
    for (let i = 0; i < trimmedArgument.length; i++) {
        const char = trimmedArgument[i];
        if (isWhitespace(char)) {
            const charBefore = trimmedArgument[i - 1];
            let charAfterIdx;
            for (let j = i + 1; j < trimmedArgument.length; j++) {
                if (!isWhitespace(trimmedArgument[j])) {
                    charAfterIdx = j;
                    break;
                }
            }
            if (!charAfterIdx) {
                throw new Error("Inconsistent trimmed argument error.");
            }
            const charAfter = trimmedArgument[charAfterIdx];
            if ((isOperator(charBefore) && isOperator(charAfter)) || (isDigit(charBefore) && isDigit(charAfter))) {
                throw new Error("Bad argument.");
            }
            i = charAfterIdx - 1;
        }
    }
    const strippedArgument = argument.replace(/\s+/g, '');
    let scan = '';
    let tokens = [];
    [...Array.from(strippedArgument), EOF].forEach((char) => {
        if (char === EOF) {
            const operand = toNumberOrThrow(scan);
            tokens.push(operand);
            return;
        }
        if (isOperator(char)) {
            const operand = toNumberOrThrow(scan);
            tokens.push(operand);
            scan = '';
            tokens.push(char);
            return;
        }
        if (isDigit(char)) {
            scan += char;
            return;
        }
        throw new Error(`Failed to parse character ${char}`);
    });
    while (tokens.length > 1) {
        if (tokens.length < 3) {
            throw new Error("Inconsistent lenght");
        }
        const firstOperand = tokens[0];
        const operator = tokens[1];
        const secondOperand = tokens[2];
        const [parsedFirstOperand, parsedSecondOperand] = parseOperands(firstOperand, secondOperand);
        let result = null;
        if (operator === '+') {
            result = parsedFirstOperand + parsedSecondOperand;
        }
        else if (operator === "-") {
            result = parsedFirstOperand - parsedSecondOperand;
        }
        else {
            throw new Error("Inconsistent tokenization");
        }
        tokens = [result, ...tokens.slice(3)];
    }
    if (tokens.length === 0) {
        throw new Error("Inconsistent tokenization");
    }
    const result = tokens[0];
    if (typeof result !== 'number') {
        throw new Error("Inconsistent tokenization");
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

# Go Interpreter (TypeScript Implementation)

An interpreter written in TypeScript that executes a subset of the Go programming language. This project demonstrates the complete interpretation pipeline from lexical analysis to direct execution.

## 🚀 Features

### Supported Language Constructs

- **Data Types**: `int`, `string`, `bool`
- **Variables**: Declaration with `var` keyword and type annotations
- **Functions**: Function declarations with parameters and return values
- **Operators**:
  - Arithmetic: `+`, `-`, `*`, `/`
  - Comparison: `==`, `>`, `<`
  - Logical: `&&`, `||`, `!`
  - String concatenation: `+`
- **Control Flow**:
  - `if`/`else` statements
  - `for` loops (while-style)
  - `return` statements
- **I/O Operations**:
  - `Println()` - Print output to console
  - `Scan()` - Read integer input from user
- **Comments**: Single-line comments with `//`

### Interpretation Pipeline

1. **Preprocessing** (`PrePro`): Removes comments and empty lines
2. **Lexical Analysis** (`Tokenizer`): Converts source code into tokens
3. **Syntax Analysis** (`Parser`): Builds an Abstract Syntax Tree (AST)
4. **Interpretation** (`Node.evaluate()`): Directly executes the AST with runtime type checking via `SymbolTable`

## 📁 Project Structure

```
go-compiler/
├── examples/                 # Example Go programs
│   ├── basic_program.go      # Variables, conditionals, loops
│   ├── functions.go          # Function declarations and calls
│   ├── string_operations.go  # String concatenation
│   └── user_input.go         # Using Scan() for input
├── src/
│   ├── index.ts              # Entry point
│   ├── lib/
│   │   ├── debug.ts          # Debug utilities
│   │   ├── enums.ts          # Token types and representations
│   │   ├── hooks.ts          # OnReturn exception for function returns
│   │   ├── input.ts          # Input handling
│   │   └── utils.ts          # Helper functions
│   ├── modules/
│   │   ├── Node.ts           # AST node implementations with evaluate methods
│   │   ├── Parser.ts         # Syntax analyzer (recursive descent)
│   │   ├── PrePro.ts         # Preprocessor
│   │   ├── SymbolTable.ts    # Symbol table for variables and functions
│   │   ├── Token.ts          # Token class
│   │   └── Tokenizer.ts      # Lexical analyzer
│   └── source.go             # Example Go source file
├── package.json
└── tsconfig.json
```

## 🛠️ Installation

```bash
npm install
```

## 📖 Usage

### Run a Go file

```bash
npm start path/to/file.go
```

The interpreter will parse and execute the program directly.

### Run from a string (legacy support)

```bash
npm start "func main() { Println(42) }"
```

### Build the TypeScript project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

## 💡 Examples

All example files are located in the `examples/` directory. You can run any of them with:

```bash
npm start examples/<filename>.go
```

### Basic Program (`examples/basic_program.go`)

Demonstrates variables, arithmetic, conditionals, and loops.

```go
func main() {
    var x int = 10
    var y int = 20
    var result int = x + y
    Println(result)  // Outputs: 30
    
    if result > 25 {
        Println(1)   // Outputs: 1
    } else {
        Println(0)
    }
    
    for result > 0 {
        result = result - 1
    }
}
```

### Functions with Parameters (`examples/functions.go`)

Shows function declarations with parameters and return values.

```go
func add(a int, b int) int {
    return a + b
}

func greet(name string) {
    Println("Hello, " + name + "!")
}

func main() {
    var sum int = add(10, 20)
    Println(sum)          // Outputs: 30
    
    greet("World")        // Outputs: Hello, World!
}
```

### String Operations (`examples/string_operations.go`)

Demonstrates string concatenation.

```go
func main() {
    var firstName string = "John"
    var lastName string = "Doe"
    var fullName string = firstName + " " + lastName
    Println(fullName)     // Outputs: John Doe
}
```

### User Input (`examples/user_input.go`)

Shows how to read user input with `Scan()`.

```go
func main() {
    Println("Enter your age:")
    var age int = Scan()
    Println("You are:")
    Println(age)
}
```

## 🏗️ Architecture

### Tokenizer

Performs lexical analysis by:
- Scanning source code character by character
- Recognizing keywords (`func`, `var`, `return`, `if`, `else`, `for`)
- Identifying operators, literals, and identifiers
- Producing a stream of tokens for the parser

### Parser

Implements a recursive descent parser that:
- Follows operator precedence rules
- Builds an Abstract Syntax Tree (AST)
- Uses the `readSequential` helper for parsing token sequences
- Handles expressions, statements, blocks, and function declarations
- Requires a `main()` function as the entry point
- Automatically inserts a call to `main()` at the end of the program

**Expression Precedence** (lowest to highest):
1. Boolean OR (`||`)
2. Boolean AND (`&&`)
3. Relational (`==`, `>`, `<`)
4. Additive (`+`, `-`)
5. Multiplicative (`*`, `/`)
6. Unary (`+`, `-`, `!`)
7. Primary (literals, identifiers, parentheses, function calls)

### AST Nodes

Each node type implements:
- `evaluate(symbolTable: SymbolTable)`: Interprets the node and returns a typed value

**Node Types**:
- `BinOp`: Binary operations (arithmetic, logical, comparison)
- `UnOp`: Unary operations (negation, logical not)
- `IntVal`, `StringVal`, `BoolVal`: Literal values
- `Identifier`: Variable references
- `Assignment`: Variable assignment
- `VarDec`: Variable declaration (with optional initialization)
- `Block`: Statement block (creates nested scope)
- `If`: Conditional statement
- `While`: Loop statement (uses `for` keyword Go-style)
- `Print`: Output statement
- `Scan`: Input statement
- `FuncDec`: Function declaration
- `FuncCall`: Function call with arguments
- `Return`: Return statement (throws `OnReturn` exception)
- `NoOp`: Empty statement

### Symbol Table

Manages variable and function scope:
- Tracks variable declarations with types
- Stores function declarations with parameter lists and return types
- Enforces type safety at runtime
- Supports nested scopes through parent-child relationships
- Prevents redeclaration errors in the same scope

When a function is called, a new `SymbolTable` is created with the outer scope as its parent, allowing:
- Parameters to shadow outer variables
- Local variables to be isolated
- Access to outer scope variables when not shadowed

### Return Handling

Function returns are implemented using exceptions:
- `Return` nodes throw an `OnReturn` exception containing the return value and type
- `FuncCall` catches `OnReturn` to retrieve the return value
- Return type checking ensures functions return the declared type (or nothing if no return type is specified)

## ⚠️ Important Notes

### Token State Management

A common source of bugs is state mismatch when fetching tokens:

- `Tokenizer.getNext()`: Returns the current token (read-only)
- `Tokenizer.selectNext()`: Advances to the next token (mutates state)

**❌ Don't do this:**
```typescript
function parseSomething() {
  this.selectNext()
}

function main() {
  let nextToken: Token = this.Tokenizer.getNext()
  while (nextToken.getType() !== TokenType.CLOSE_PAR) {
    this.parseSomething()
    // nextToken is stale - it doesn't reflect the updated state
  }
}
```

**✅ Do this instead:**
```typescript
while (this.Tokenizer.getNext().getType() !== TokenType.CLOSE_PAR) {
  this.parseSomething()
}
```

### Program Structure Requirements

All Go programs must:
1. Contain at least one function declaration
2. Include a `main()` function with no parameters
3. Have function declarations at the top level (not nested)
4. Global variable declarations are supported at the top level

## 📝 Language Grammar

```
Program       ::= (FuncDeclaration | VarDeclaration | "\n")* EOF
FuncDeclaration::= "func" Identifier "(" Parameters? ")" Type? Block
Parameters    ::= Parameter ("," Parameter)*
Parameter     ::= Identifier Type
Block         ::= "{" "\n" Statement* "}"
Statement     ::= Assignment | VarDeclaration | Print | If | While | Return | FuncCall | Block | "\n"
Assignment    ::= Identifier "=" BoolExpr "\n"
VarDeclaration::= "var" Identifier Type ["=" BoolExpr] "\n"
Print         ::= "Println" "(" BoolExpr ")" "\n"
FuncCall      ::= Identifier "(" Arguments? ")" "\n"
Arguments     ::= BoolExpr ("," BoolExpr)*
If            ::= "if" BoolExpr Block ["else" Block] "\n"
While         ::= "for" BoolExpr Block "\n"
Return        ::= "return" BoolExpr
BoolExpr      ::= BoolTerm ("||" BoolTerm)*
BoolTerm      ::= RelExpr ("&&" RelExpr)*
RelExpr       ::= Expr (("==" | ">" | "<") Expr)?
Expr          ::= Term (("+" | "-") Term)*
Term          ::= Factor (("*" | "/") Factor)*
Factor        ::= ("+" | "-" | "!") Factor
                | Int | String | Bool | Identifier
                | "(" BoolExpr ")"
                | Identifier "(" Arguments? ")"
                | "Scan" "(" ")"
Type          ::= "int" | "string" | "bool"
```

## 🚧 Limitations

This is a simplified interpreter that:
- Supports only a subset of Go
- Has limited scope management (function-level and block-level only)
- Doesn't support arrays, slices, structs, or pointers
- Doesn't support methods or interfaces
- Limited string operations (concatenation and comparison only)
- No type inference - all variables must have explicit types
- Integer division always rounds down (truncates)
- `Scan()` only reads integers
- No package system or imports


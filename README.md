# Go Compiler (TypeScript Implementation)

A compiler written in TypeScript that parses a subset of the Go programming language and generates x86 assembly code. This compiler demonstrates the complete compilation pipeline from lexical analysis to code generation.

## 🚀 Features

### Supported Language Constructs

- **Data Types**: `int`, `string`, `bool`
- **Variables**: Declaration with `var` keyword and type annotations
- **Operators**:
  - Arithmetic: `+`, `-`, `*`, `/`
  - Comparison: `==`, `>`, `<`
  - Logical: `&&`, `||`, `!`
- **Control Flow**:
  - `if`/`else` statements
  - `for` loops (while-style)
- **I/O Operations**:
  - `Println()` - Print output
  - `Scan()` - Read input
- **Comments**: Single-line comments with `//`

### Compilation Pipeline

1. **Preprocessing** (`PrePro`): Removes comments and empty lines
2. **Lexical Analysis** (`Tokenizer`): Converts source code into tokens
3. **Syntax Analysis** (`Parser`): Builds an Abstract Syntax Tree (AST)
4. **Semantic Analysis** (`SymbolTable`): Type checking and variable management
5. **Code Generation** (`Code`): Produces x86 assembly code

## 📁 Project Structure

```
ts-compiler/
├── src/
│   ├── index.ts              # Entry point
│   ├── lib/
│   │   ├── debug.ts          # Debug utilities
│   │   ├── enums.ts          # Token types and representations
│   │   ├── input.ts          # Input handling
│   │   └── utils.ts          # Helper functions
│   └── modules/
│       ├── Code.ts           # Assembly code generator
│       ├── Node.ts           # AST node implementations
│       ├── NodeIdService.ts  # Unique ID generator for nodes
│       ├── Parser.ts         # Syntax analyzer
│       ├── PrePro.ts         # Preprocessor
│       ├── SymbolTable.ts    # Symbol table for variables
│       ├── Token.ts          # Token class
│       └── Tokenizer.ts      # Lexical analyzer
├── package.json
└── tsconfig.json
```

## 🛠️ Installation

```bash
cd ts-compiler
npm install
```

## 📖 Usage

### Compile from a Go file

```bash
npm start path/to/file.go
```

This will generate a corresponding `.asm` file in the same directory.

### Compile from a string

```bash
npm start "{ Println(42) }"
```

### Build the TypeScript project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Build and copy to parent directory

```bash
npm run build-cp
```

## 💡 Example

### Input (Go code)

```go
{
    var x int = 10
    var y int = 20
    var result int = x + y
    Println(result)
    
    if result > 25 {
        Println(1)
    } else {
        Println(0)
    }
    
    for result > 0 {
        result = result - 1
    }
}
```

### Output (x86 Assembly)

The compiler generates x86 assembly code that:
- Uses `printf` for output
- Uses `scanf` for input
- Manages variables on the stack with EBP-relative addressing
- Implements control flow with labels and jumps

## 🏗️ Architecture

### Tokenizer

Performs lexical analysis by:
- Scanning source code character by character
- Recognizing keywords, operators, literals, and identifiers
- Producing a stream of tokens for the parser

### Parser

Implements a recursive descent parser that:
- Follows operator precedence rules
- Builds an Abstract Syntax Tree (AST)
- Uses the `readSequential` helper for parsing token sequences
- Handles expressions, statements, and blocks

**Expression Precedence** (lowest to highest):
1. Boolean OR (`||`)
2. Boolean AND (`&&`)
3. Relational (`==`, `>`, `<`)
4. Additive (`+`, `-`)
5. Multiplicative (`*`, `/`)
6. Unary (`+`, `-`, `!`)
7. Primary (literals, identifiers, parentheses)

### AST Nodes

Each node type implements:
- `evaluate()`: Interprets the node (for testing/debugging)
- `generate()`: Emits x86 assembly code

**Node Types**:
- `BinOp`: Binary operations (arithmetic, logical, comparison)
- `UnOp`: Unary operations (negation, not)
- `IntVal`, `StringVal`, `BoolVal`: Literal values
- `Identifier`: Variable references
- `Assignment`: Variable assignment
- `VarDec`: Variable declaration
- `Block`: Statement block
- `If`: Conditional statement
- `While`: Loop statement
- `Print`: Output statement
- `Scan`: Input statement
- `NoOp`: Empty statement

### Symbol Table

Manages variable scope and types:
- Tracks variable declarations
- Enforces type safety
- Assigns stack offsets for code generation
- Prevents redeclaration errors

### Code Generator

Produces x86 assembly with:
- EBP-based stack frame management
- Integration with C standard library (`printf`, `scanf`)
- Linux syscalls for program exit
- Unique labels for control flow (loops, conditionals)

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

## 🔧 Assembly Generation

The generated assembly:
- Uses the Linux x86 ABI
- Requires `nasm` for assembly and `gcc` for linking
- Calls external C functions for I/O

### Running Generated Assembly

```bash
# Assemble
nasm -f elf32 output.asm -o output.o

# Link with C library
gcc -m32 output.o -o output

# Execute
./output
```

## 📝 Language Grammar

```
Block         ::= "{" "\n" Statement* "}"
Statement     ::= Assignment | VarDeclaration | Print | If | While | "\n"
Assignment    ::= Identifier "=" BoolExpr "\n"
VarDeclaration::= "var" Identifier Type ["=" BoolExpr] "\n"
Print         ::= "Println" "(" BoolExpr ")" "\n"
If            ::= "if" BoolExpr Block ["else" Block] "\n"
While         ::= "for" BoolExpr Block "\n"
BoolExpr      ::= BoolTerm ("||" BoolTerm)*
BoolTerm      ::= RelExpr ("&&" RelExpr)*
RelExpr       ::= Expr (("==" | ">" | "<") Expr)?
Expr          ::= Term (("+" | "-") Term)*
Term          ::= Factor (("*" | "/") Factor)*
Factor        ::= ("+" | "-" | "!") Factor
                | Int | String | Bool | Identifier
                | "(" BoolExpr ")"
                | "Scan" "(" ")"
```

## 🚧 Limitations

This is a simplified compiler that:
- Supports only a subset of Go
- Generates 32-bit x86 assembly
- Has a single global scope (no nested scopes)
- Doesn't support functions (beyond built-ins)
- Doesn't support arrays, slices, or structs
- Limited string operations

## 📄 License

See [LICENSE.md](LICENSE.md) for details.

## 🔖 Versioning

To issue new releases:

```bash
git tag -a v0.1.1 -m "Message about the release"
git push origin v0.1.1
```

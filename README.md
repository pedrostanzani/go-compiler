![git status](http://3.129.230.99/svg/pedrostanzani/compiler/)

To issue new releases, run:

```
git tag -a v0.1.1 -m "Message about the release"
git push origin v0.1.1
```

### ⚠️ Attention
A common source of bugs is when a state mismatch occurs in the process of fetching the nextToken.
- The `Tokenizer.getNext()` function returns the token that is currently placed as nextToken. **It is a read-only method.**
- The `Tokenizer.selectNext()` function extracts the next token from the sourceCode, and sets it as the nextToken. **It is a state mutating method.**

What may happen is:
```ts
function parseSomething() {
  this.selectNext()
}

function main() {
  let nextToken: Token = this.Tokenizer.getNext()
  while (nextToken.getType() !== TokenType.CLOSE_PAR) {
    this.parseSomething()
    // Even though Tokenizer.selectNext() is called inside 
    // parseSomething(), the `nextToken` variable declared above
    // never has its state updated.
    // This will provoke unexpected behavior.
  }
}
```

To avoid this, always prefer to access nextToken directly from the Tokenizer instance. Like so:
```ts
  while (this.Tokenizer.getNext().getType() !== TokenType.CLOSE_PAR) {
    this.parseSomething()
  }
```

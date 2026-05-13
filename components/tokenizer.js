const { VezeSyntaxError } = require('./error');

const KEYWORDS = new Set([
  'show', 'if', 'else', 'func', 'return', 'import', 'on',
  'repeat', 'for', 'each', 'in', 'times', 'from',
  'try', 'catch', 'not', 'is', 'true', 'false'
]);

class Tokenizer {
  constructor(code) {
    this.code = code;
    this.position = 0;
    this.line = 1;
    this.tokens = [];
  }

  peek(offset = 0) {
    return this.code[this.position + offset];
  }

  advance() {
    const ch = this.code[this.position++];
    if (ch === '\n') this.line++;
    return ch;
  }

  isDigit(ch) { return ch >= '0' && ch <= '9'; }
  isAlpha(ch) { return /[a-zA-Zа-яА-ЯёЁ_]/.test(ch); }
  isAlphaNum(ch) { return this.isAlpha(ch) || this.isDigit(ch); }
  isAtEnd() { return this.position >= this.code.length; }

  skipWhitespace() {
    while (!this.isAtEnd() && /[ \t\r\n]/.test(this.peek())) {
      this.advance();
    }
  }

  skipComment() {
    const line = this.line;
    this.advance(); // #
    this.advance(); // {
    while (!this.isAtEnd()) {
      if (this.peek() === '}') {
        this.advance();
        return;
      }
      this.advance();
    }
    throw new VezeSyntaxError('незакрытый комментарий #{', line);
  }

  readString() {
    const line = this.line;
    this.advance(); // opening "
    let value = '';
    while (!this.isAtEnd() && this.peek() !== '"') {
      if (this.peek() === '\n') throw new VezeSyntaxError('незакрытая строка', line);
      value += this.advance();
    }
    if (this.isAtEnd()) throw new VezeSyntaxError('незакрытая строка', line);
    this.advance(); // closing "
    return { type: 'STRING', value, line };
  }

  readNumber() {
    const line = this.line;
    let value = '';
    while (!this.isAtEnd() && this.isDigit(this.peek())) {
      value += this.advance();
    }
    if (this.peek() === '.' && this.isDigit(this.peek(1))) {
      value += this.advance();
      while (!this.isAtEnd() && this.isDigit(this.peek())) {
        value += this.advance();
      }
    }
    return { type: 'NUMBER', value: Number(value), line };
  }

  readWord() {
    const line = this.line;
    let value = '';
    while (!this.isAtEnd() && this.isAlphaNum(this.peek())) {
      value += this.advance();
    }
    if (value === 'true' || value === 'false') {
      return { type: 'BOOLEAN', value: value === 'true', line };
    }
    if (KEYWORDS.has(value)) {
      return { type: 'KEYWORD', value, line };
    }
    return { type: 'IDENTIFIER', value, line };
  }

  readOperatorOrPunctuation() {
    const line = this.line;
    const ch = this.advance();

    if (ch === '=' && this.peek() === '>') {
      this.advance();
      return { type: 'PUNCTUATION', value: '=>', line };
    }
    if (ch === '=' && this.peek() === '=') {
      this.advance();
      return { type: 'OPERATOR', value: '==', line };
    }
    if (ch === '>' && this.peek() === '=') {
      this.advance();
      return { type: 'OPERATOR', value: '>=', line };
    }
    if (ch === '<' && this.peek() === '=') {
      this.advance();
      return { type: 'OPERATOR', value: '<=', line };
    }
    if (ch === '!' && this.peek() === '=') {
      this.advance();
      return { type: 'OPERATOR', value: '!=', line };
    }
    if (ch === '>') return { type: 'OPERATOR', value: ch, line };
    if (ch === '<') return { type: 'OPERATOR', value: ch, line };

    if ('+-*/'.includes(ch)) return { type: 'OPERATOR', value: ch, line };
    if (ch === '=')          return { type: 'OPERATOR', value: ch, line };
    if ('()[]{},.'.includes(ch)) return { type: 'PUNCTUATION', value: ch, line };
    if (ch === ':')          return { type: 'PUNCTUATION', value: ch, line };

    throw new VezeSyntaxError(`неизвестный символ "${ch}"`, line);
  }

  tokenize() {
    while (!this.isAtEnd()) {
      this.skipWhitespace();
      if (this.isAtEnd()) break;

      const ch = this.peek();

      if (ch === '#' && this.peek(1) === '{') {
        this.skipComment();
        continue;
      }

      if (ch === '"') {
        this.tokens.push(this.readString());
        continue;
      }

      if (this.isDigit(ch)) {
        this.tokens.push(this.readNumber());
        continue;
      }

      if (this.isAlpha(ch)) {
        this.tokens.push(this.readWord());
        continue;
      }

      this.tokens.push(this.readOperatorOrPunctuation());
    }

    this.tokens.push({ type: 'EOF', value: null, line: this.line });
    return this.tokens;
  }
}

module.exports = Tokenizer;

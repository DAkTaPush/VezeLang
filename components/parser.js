const { VezeSyntaxError } = require('./error');

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  // --- Token helpers ---

  peek(offset = 0) {
    return this.tokens[this.position + offset] || { type: 'EOF', value: null, line: null };
  }

  advance() {
    return this.tokens[this.position++];
  }

  isAtEnd() {
    return this.peek().type === 'EOF';
  }

  expect(type, value = null) {
    const token = this.advance();
    if (token.type !== type) {
      throw new VezeSyntaxError(
        `ожидался ${type}${value ? ' "' + value + '"' : ''}, получен "${token.value}"`,
        token.line
      );
    }
    if (value !== null && token.value !== value) {
      throw new VezeSyntaxError(`ожидался "${value}", получен "${token.value}"`, token.line);
    }
    return token;
  }

  match(type, value = null) {
    const t = this.peek();
    if (t.type !== type) return false;
    if (value !== null && t.value !== value) return false;
    return true;
  }

  // --- Main entry ---

  parse() {
    const body = [];
    while (!this.isAtEnd()) {
      body.push(this.parseStatement());
    }
    return body;
  }

  // --- Statement dispatch ---

  parseStatement() {
    const t = this.peek();

    if (t.type === 'KEYWORD') {
      switch (t.value) {
        case 'show':   return this.parseShow();
        case 'if':     return this.parseIf();
        case 'on':     return this.parseEventHandler();
        case 'import': return this.parseImport();
        case 'func':   return this.parseFunctionDeclaration();
        case 'return': return this.parseReturn();
        case 'try':    return this.parseTryCatch();
        case 'repeat': return this.parseRepeatLoop();
        case 'for':    return this.parseForEachLoop();
      }
    }

    if (t.type === 'IDENTIFIER') {
      const next  = this.peek(1);
      const next2 = this.peek(2);
      const next3 = this.peek(3);
      if (next.type === 'OPERATOR' && next.value === '=') {
        return this.parseVariableAssignment();
      }
      if (next.type  === 'PUNCTUATION' && next.value  === '.'  &&
          next2.type === 'IDENTIFIER'  &&
          next3.type === 'OPERATOR'    && next3.value === '=') {
        return this.parsePropertyAssignment();
      }
      if (next.type === 'PUNCTUATION' && next.value === '(') {
        return { type: 'ExpressionStatement', expression: this.parseFunctionCallExpr(), line: t.line };
      }
    }

    throw new VezeSyntaxError(`неожиданный токен "${t.value}"`, t.line);
  }

  // --- Statements ---

  parseShow() {
    const line = this.peek().line;
    this.expect('KEYWORD', 'show');
    const value = this.parseExpression();
    this.expect('KEYWORD', 'in');
    const target = this.parseMemberPath();
    return { type: 'ShowStatement', value, target, line };
  }

  parseVariableAssignment() {
    const line = this.peek().line;
    const name = this.expect('IDENTIFIER').value;
    this.expect('OPERATOR', '=');
    const value = this.parseExpression();
    return { type: 'VariableAssignment', name, value, line };
  }

  parsePropertyAssignment() {
    const line   = this.peek().line;
    const object = this.expect('IDENTIFIER').value;
    this.expect('PUNCTUATION', '.');
    const property = this.expect('IDENTIFIER').value;
    this.expect('OPERATOR', '=');
    const value = this.parseExpression();
    return { type: 'PropertyAssignment', object, property, value, line };
  }

  parseIf() {
    const line = this.peek().line;
    this.expect('KEYWORD', 'if');
    const condition = this.parseCondition();
    const body = this.parseBlock('[', ']');
    let elseBody = null;
    if (this.match('KEYWORD', 'else')) {
      this.advance();
      elseBody = this.parseBlock('[', ']');
    }
    return { type: 'IfStatement', condition, body, elseBody, line };
  }

  parseCondition() {
    if (this.match('KEYWORD', 'not')) {
      this.advance();
      const identifier = this.expect('IDENTIFIER').value;
      return { type: 'BooleanCheck', identifier, negated: true };
    }

    if (this.peek(1).type === 'KEYWORD' && this.peek(1).value === 'is') {
      const left = this.parsePrimary();
      this.expect('KEYWORD', 'is');
      const right = this.parsePrimary();
      return { type: 'Comparison', left, operator: 'is', right };
    }

    const identifier = this.expect('IDENTIFIER').value;
    return { type: 'BooleanCheck', identifier, negated: false };
  }

  parseEventHandler() {
    const line = this.peek().line;
    this.expect('KEYWORD', 'on');
    const event = this.expect('IDENTIFIER').value;
    this.expect('PUNCTUATION', '(');
    let target = null;
    if (!this.match('PUNCTUATION', ')')) {
      const t = this.peek();
      if (t.type === 'STRING' || t.type === 'IDENTIFIER' || t.type === 'KEYWORD') {
        target = this.advance().value;
      }
    }
    this.expect('PUNCTUATION', ')');
    this.expect('PUNCTUATION', '=>');
    const body = this.parseBlock('{', '}');
    return { type: 'EventHandler', event, target, body, line };
  }

  parseImport() {
    const line = this.peek().line;
    this.expect('KEYWORD', 'import');
    if (this.match('KEYWORD', 'from')) {
      this.advance();
      const path = this.expect('STRING').value;
      return { type: 'ImportStatement', path, line };
    }
    const t = this.advance();
    return { type: 'ImportStatement', module: t.value, line };
  }

  parseFunctionDeclaration() {
    const line = this.peek().line;
    this.expect('KEYWORD', 'func');
    const name = this.expect('IDENTIFIER').value;
    this.expect('PUNCTUATION', '(');
    const params = [];
    while (!this.match('PUNCTUATION', ')') && !this.isAtEnd()) {
      params.push(this.expect('IDENTIFIER').value);
      if (this.match('PUNCTUATION', ',')) this.advance();
    }
    this.expect('PUNCTUATION', ')');
    this.expect('PUNCTUATION', '=>');
    const body = this.parseBlock('{', '}');
    return { type: 'FunctionDeclaration', name, params, body, line };
  }

  parseReturn() {
    const line = this.peek().line;
    this.expect('KEYWORD', 'return');
    const value = this.parseExpression();
    return { type: 'ReturnStatement', value, line };
  }

  parseTryCatch() {
    const line = this.peek().line;
    this.expect('KEYWORD', 'try');
    const body = this.parseBlock('{', '}');
    this.expect('KEYWORD', 'catch');
    const errorName = this.expect('IDENTIFIER').value;
    const catchBody = this.parseBlock('[', ']');
    return { type: 'TryCatch', body, errorName, catchBody, line };
  }

  parseRepeatLoop() {
    const line = this.peek().line;
    this.expect('KEYWORD', 'repeat');
    const count = this.parsePrimary();
    this.expect('KEYWORD', 'times');
    this.expect('PUNCTUATION', '=>');
    const body = this.parseBlock('{', '}');
    return { type: 'RepeatLoop', count, body, line };
  }

  parseForEachLoop() {
    const line = this.peek().line;
    this.expect('KEYWORD', 'for');
    this.expect('KEYWORD', 'each');
    const item = this.expect('IDENTIFIER').value;
    this.expect('KEYWORD', 'in');
    const list = this.parsePrimary();
    this.expect('PUNCTUATION', '=>');
    const body = this.parseBlock('{', '}');
    return { type: 'ForEachLoop', item, list, body, line };
  }

  parseFunctionCallExpr() {
    const line = this.peek().line;
    const name = this.expect('IDENTIFIER').value;
    const args = this.parseArgList();
    return { type: 'FunctionCall', name, args, line };
  }

  // --- Block ---

  parseBlock(open, close) {
    this.expect('PUNCTUATION', open);
    const statements = [];
    while (!this.match('PUNCTUATION', close) && !this.isAtEnd()) {
      statements.push(this.parseStatement());
    }
    this.expect('PUNCTUATION', close);
    return statements;
  }

  // --- Expressions ---

  parseExpression() {
    return this.parseAdditive();
  }

  parseAdditive() {
    let left = this.parseMultiplicative();
    while (this.match('OPERATOR', '+') || this.match('OPERATOR', '-')) {
      const op = this.advance().value;
      const right = this.parseMultiplicative();
      left = { type: 'BinaryExpression', operator: op, left, right, line: left.line };
    }
    return left;
  }

  parseMultiplicative() {
    let left = this.parsePrimary();
    while (this.match('OPERATOR', '*') || this.match('OPERATOR', '/')) {
      const op = this.advance().value;
      const right = this.parsePrimary();
      left = { type: 'BinaryExpression', operator: op, left, right, line: left.line };
    }
    return left;
  }

  parsePrimary() {
    const t = this.peek();

    if (t.type === 'STRING')  { this.advance(); return { type: 'StringLiteral',  value: t.value, line: t.line }; }
    if (t.type === 'NUMBER')  { this.advance(); return { type: 'NumberLiteral',  value: t.value, line: t.line }; }
    if (t.type === 'BOOLEAN') { this.advance(); return { type: 'BooleanLiteral', value: t.value, line: t.line }; }

    if (t.type === 'PUNCTUATION' && t.value === '[') return this.parseListLiteral();
    if (t.type === 'PUNCTUATION' && t.value === '{') return this.parseObjectLiteral();

    if (t.type === 'IDENTIFIER') {
      const line = t.line;
      this.advance();
      let expr = { type: 'Identifier', value: t.value, line };
      if (this.match('PUNCTUATION', '(')) {
        const args = this.parseArgList();
        expr = { type: 'FunctionCall', name: t.value, args, line };
      }
      return this.parsePostfix(expr);
    }

    // Keywords used as values: window, math, error, etc.
    if (t.type === 'KEYWORD') {
      this.advance();
      return this.parsePostfix({ type: 'Identifier', value: t.value, line: t.line });
    }

    throw new VezeSyntaxError(`неожиданный токен "${t.value}" в выражении`, t.line);
  }

  parseArgList() {
    this.expect('PUNCTUATION', '(');
    const args = [];
    while (!this.match('PUNCTUATION', ')') && !this.isAtEnd()) {
      args.push(this.parseExpression());
      if (this.match('PUNCTUATION', ',')) this.advance();
    }
    this.expect('PUNCTUATION', ')');
    return args;
  }

  parsePostfix(expr) {
    while (true) {
      if (this.match('PUNCTUATION', '[')) {
        const line = this.peek().line;
        this.advance();
        const index = this.parseExpression();
        this.expect('PUNCTUATION', ']');
        expr = { type: 'ListAccess', object: expr, index, line };
      } else if (this.match('PUNCTUATION', '.')) {
        const line = this.peek().line;
        this.advance();
        const property = this.expect('IDENTIFIER').value;
        expr = { type: 'ObjectAccess', object: expr, property, line };
      } else {
        break;
      }
    }
    return expr;
  }

  parseListLiteral() {
    const line = this.peek().line;
    this.expect('PUNCTUATION', '[');
    const elements = [];
    while (!this.match('PUNCTUATION', ']') && !this.isAtEnd()) {
      elements.push(this.parseExpression());
      if (this.match('PUNCTUATION', ',')) this.advance();
    }
    this.expect('PUNCTUATION', ']');
    return { type: 'ListLiteral', elements, line };
  }

  parseObjectLiteral() {
    const line = this.peek().line;
    this.expect('PUNCTUATION', '{');
    const properties = {};
    while (!this.match('PUNCTUATION', '}') && !this.isAtEnd()) {
      const key = this.expect('IDENTIFIER').value;
      this.expect('PUNCTUATION', ':');
      const value = this.parseExpression();
      properties[key] = value;
      if (this.match('PUNCTUATION', ',')) this.advance();
    }
    this.expect('PUNCTUATION', '}');
    return { type: 'ObjectLiteral', properties, line };
  }

  parseMemberPath() {
    let path = this.advance().value;
    while (this.match('PUNCTUATION', '.')) {
      this.advance();
      path += '.' + this.advance().value;
    }
    return path;
  }
}

module.exports = Parser;

const fs   = require('fs');
const path = require('path');
const { VezeRuntimeError, VezeImportError, VezeTypeError } = require('./error');

class ReturnSignal {
  constructor(value) { this.value = value; }
}

class Interpreter {
  constructor() {
    this.globals   = {};
    this.functions = {};
    this.events    = {};
    this.windowLib = null;
  }

  // --- Entry points ---

  async run(ast) {
    for (const node of ast) {
      const sig = this.execute(node, this.globals);
      if (sig instanceof ReturnSignal) break;
    }
    this.fireEvent('load', 'window');

    if (this.windowLib) {
      const ui12 = this.globals['ui12'];
      if (ui12 && typeof ui12.getCSS === 'function') {
        this.windowLib.setStyles(ui12.getCSS());
      }
      for (const [key, handler] of Object.entries(this.events)) {
        const colonIdx = key.indexOf(':');
        const event  = key.slice(0, colonIdx);
        const target = key.slice(colonIdx + 1);
        if (event === 'click') this.windowLib.registerButton(target);
        if (event === 'input') this.windowLib.registerInput(target);
        if (event === 'card')  this.windowLib.registerCard(handler.args[0], handler.args[1] || '');
        if (event === 'alert') this.windowLib.registerAlert(target);
      }
      this.windowLib.setCallback((event, target) => this.fireEvent(event, target));
      this.windowLib.open();
    } else {
      for (const [key, handler] of Object.entries(this.events)) {
        const colonIdx = key.indexOf(':');
        const event  = key.slice(0, colonIdx);
        const target = key.slice(colonIdx + 1);
        if (event === 'click') {
          throw new VezeRuntimeError('on click() requires import window', handler.line);
        }
        if (event === 'card') {
          throw new VezeRuntimeError('on card() requires import window', handler.line);
        }
        if (event === 'alert') {
          console.warn('⚠ ' + (target || 'Alert'));
          this.runBlock(handler.body, this.globals);
        }
        if (event === 'input') {
          await this._promptTerminalInput(target, handler.body);
        }
      }
    }
  }

  async _promptTerminalInput(prompt, body) {
    const readline = require('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
      rl.question((prompt || 'Input') + ': ', _answer => {
        rl.close();
        this.runBlock(body, this.globals);
        resolve();
      });
    });
  }

  runBlock(stmts, scope) {
    for (const node of stmts) {
      const sig = this.execute(node, scope);
      if (sig instanceof ReturnSignal) return sig;
    }
  }

  // --- Statement execution ---

  execute(node, scope) {
    switch (node.type) {

      case 'ShowStatement': {
        const value  = this.evaluate(node.value, scope);
        const target = node.target;
        if (target === 'console') {
          console.log(value);
        } else if (target === 'window' || target.startsWith('window.')) {
          if (this.windowLib) {
            this.windowLib.show(value);
          } else {
            console.log(value);
          }
        } else {
          console.log(value);
        }
        return;
      }

      case 'VariableAssignment': {
        scope[node.name] = this.evaluate(node.value, scope);
        return;
      }

      case 'PropertyAssignment': {
        const obj = this.globals[node.object];
        if (!obj) throw new VezeRuntimeError(`объект "${node.object}" не определён`, node.line);
        const val = this.evaluate(node.value, scope);
        if (typeof obj.set === 'function') {
          obj.set(node.property, val);
        } else {
          obj[node.property] = val;
        }
        return;
      }

      case 'IfStatement': {
        const ok = this.evalCondition(node.condition, scope);
        if (ok) return this.runBlock(node.body, scope);
        if (node.elseBody) return this.runBlock(node.elseBody, scope);
        return;
      }

      case 'EventHandler': {
        const evKey = `${node.event}:${node.target}`;
        this.events[evKey] = { body: node.body, args: node.args || [], line: node.line };
        return;
      }

      case 'ImportStatement': {
        this.doImport(node);
        return;
      }

      case 'FunctionDeclaration': {
        this.functions[node.name] = node;
        return;
      }

      case 'ReturnStatement':
        return new ReturnSignal(this.evaluate(node.value, scope));

      case 'TryCatch': {
        try {
          return this.runBlock(node.body, scope);
        } catch (err) {
          scope[node.errorName] = err.message;
          return this.runBlock(node.catchBody, scope);
        }
      }

      case 'RepeatLoop': {
        const n = this.evaluate(node.count, scope);
        for (let i = 0; i < n; i++) {
          const sig = this.runBlock(node.body, scope);
          if (sig instanceof ReturnSignal) return sig;
        }
        return;
      }

      case 'ForEachLoop': {
        const list = this.evaluate(node.list, scope);
        if (!Array.isArray(list)) {
          throw new VezeTypeError(`"${node.item}" — ожидался список, получен ${typeof list}`, node.line);
        }
        for (const item of list) {
          scope[node.item] = item;
          const sig = this.runBlock(node.body, scope);
          if (sig instanceof ReturnSignal) return sig;
        }
        return;
      }

      case 'ExpressionStatement':
        this.evaluate(node.expression, scope);
        return;

      default:
        throw new VezeRuntimeError(`неизвестный узел AST: ${node.type}`, node.line);
    }
  }

  // --- Expression evaluation ---

  evaluate(expr, scope) {
    switch (expr.type) {

      case 'StringLiteral':  return expr.value;
      case 'NumberLiteral':  return expr.value;
      case 'BooleanLiteral': return expr.value;

      case 'Identifier': {
        const name = expr.value;
        if (name in scope) return scope[name];
        throw new VezeRuntimeError(`переменная "${name}" не определена`, expr.line);
      }

      case 'BinaryExpression': {
        const l = this.evaluate(expr.left, scope);
        const r = this.evaluate(expr.right, scope);
        const line = expr.line;

        if (expr.operator === '+') {
          if (typeof l === 'number' && typeof r === 'number') return l + r;
          if (typeof l === 'string' && typeof r === 'string') return l + r;
          throw new VezeTypeError(
            `нельзя сложить ${typeof l} и ${typeof r}`,
            line
          );
        }

        if (typeof l !== 'number' || typeof r !== 'number') {
          throw new VezeTypeError(
            `оператор "${expr.operator}" требует числа, получены ${typeof l} и ${typeof r}`,
            line
          );
        }

        switch (expr.operator) {
          case '-': return l - r;
          case '*': return l * r;
          case '/':
            if (r === 0) throw new VezeRuntimeError('деление на ноль', line);
            return l / r;
          default:
            throw new VezeRuntimeError(`неизвестный оператор: ${expr.operator}`, line);
        }
      }

      case 'FunctionCall':
        return this.callFn(expr.name, expr.args, scope, expr.line);

      case 'ListLiteral':
        return expr.elements.map(el => this.evaluate(el, scope));

      case 'ObjectLiteral': {
        const obj = {};
        for (const [k, v] of Object.entries(expr.properties)) {
          obj[k] = this.evaluate(v, scope);
        }
        return obj;
      }

      case 'ListAccess': {
        const arr = this.evaluate(expr.object, scope);
        const idx = this.evaluate(expr.index, scope);
        if (!Array.isArray(arr)) {
          throw new VezeTypeError(`индексация невозможна — не список`, expr.line);
        }
        return arr[idx];
      }

      case 'ObjectAccess': {
        const obj = this.evaluate(expr.object, scope);
        if (obj == null || typeof obj !== 'object') {
          throw new VezeTypeError(
            `нет свойства "${expr.property}" — не объект`,
            expr.line
          );
        }
        return obj[expr.property];
      }

      default:
        throw new VezeRuntimeError(`неизвестное выражение: ${expr.type}`, expr.line);
    }
  }

  // --- Condition evaluation ---

  evalCondition(cond, scope) {
    if (cond.type === 'BooleanCheck') {
      const val = scope[cond.identifier];
      return cond.negated ? !val : !!val;
    }
    if (cond.type === 'Comparison') {
      const l = this.evaluate(cond.left, scope);
      const r = this.evaluate(cond.right, scope);
      switch (cond.operator) {
        case 'is': return l === r;
        case '>':  return l > r;
        case '<':  return l < r;
        case '>=': return l >= r;
        case '<=': return l <= r;
        case '!=': return l !== r;
        default:
          throw new VezeRuntimeError(`неизвестный оператор сравнения: ${cond.operator}`);
      }
    }
    throw new VezeRuntimeError(`неизвестный тип условия: ${cond.type}`);
  }

  // --- Function calls ---

  callFn(name, argExprs, callerScope, line) {
    const mathLib = this.globals['math'];
    if (mathLib && name in mathLib && typeof mathLib[name] === 'function') {
      return mathLib[name](...argExprs.map(a => this.evaluate(a, callerScope)));
    }

    if (name in this.functions) {
      const fn = this.functions[name];
      const fnScope = Object.create(this.globals);
      fn.params.forEach((param, i) => {
        fnScope[param] = this.evaluate(argExprs[i], callerScope);
      });
      const sig = this.runBlock(fn.body, fnScope);
      return sig instanceof ReturnSignal ? sig.value : undefined;
    }

    throw new VezeRuntimeError(`функция "${name}" не найдена`, line);
  }

  // --- Import ---

  doImport(node) {
    if (node.module) {
      const libDir = path.join(__dirname, '..', 'library');
      switch (node.module) {
        case 'math':
          this.globals['math'] = require(path.join(libDir, 'math'));
          return;
        case 'window':
          this.windowLib = require(path.join(libDir, 'window'));
          this.globals['window'] = this.windowLib;
          return;
        case 'ui12':
          this.globals['ui12'] = require(path.join(libDir, 'ui12'));
          return;
        default:
          throw new VezeImportError(`модуль "${node.module}" не найден`, node.line);
      }
    }
    if (node.path) {
      const filePath = path.resolve(process.cwd(), node.path);
      let code;
      try {
        code = fs.readFileSync(filePath, 'utf8');
      } catch {
        throw new VezeImportError(`файл "${node.path}" не найден`, node.line);
      }
      const Tokenizer = require('./tokenizer');
      const Parser    = require('./parser');
      const tokens = new Tokenizer(code).tokenize();
      const ast    = new Parser(tokens).parse();
      this.runBlock(ast, this.globals);
    }
  }

  // --- Event system ---

  fireEvent(event, target) {
    const handler = this.events[`${event}:${target}`];
    if (handler) this.runBlock(handler.body, this.globals);
  }
}

module.exports = Interpreter;

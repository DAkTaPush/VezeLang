const fs   = require('fs');
const path = require('path');
const { VezeRuntimeError, VezeImportError, VezeTypeError } = require('./error');

class ReturnSignal {
  constructor(value) { this.value = value; }
}

const STDLIB = {
  math: {
    add:      (a, b) => a + b,
    subtract: (a, b) => a - b,
    multiply: (a, b) => a * b,
    divide:   (a, b) => a / b,
    sqrt:     (a)    => Math.sqrt(a),
    abs:      (a)    => Math.abs(a),
    round:    (a)    => Math.round(a),
    floor:    (a)    => Math.floor(a),
    ceil:     (a)    => Math.ceil(a),
    PI:       Math.PI,
  },
  window: {
    center: 'window.center',
    top:    'window.top',
    bottom: 'window.bottom',
  },
};

class Interpreter {
  constructor() {
    this.globals   = {};
    this.functions = {};
    this.events    = {};
  }

  // --- Entry points ---

  run(ast) {
    for (const node of ast) {
      const sig = this.execute(node, this.globals);
      if (sig instanceof ReturnSignal) break;
    }
    this.fireEvent('load', 'window');
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
        console.log(this.evaluate(node.value, scope));
        return;
      }

      case 'VariableAssignment': {
        scope[node.name] = this.evaluate(node.value, scope);
        return;
      }

      case 'IfStatement': {
        const ok = this.evalCondition(node.condition, scope);
        if (ok) return this.runBlock(node.body, scope);
        if (node.elseBody) return this.runBlock(node.elseBody, scope);
        return;
      }

      case 'EventHandler': {
        this.events[`${node.event}:${node.target}`] = node.body;
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
      if (cond.operator === 'is') return l === r;
      throw new VezeRuntimeError(`неизвестный оператор сравнения: ${cond.operator}`);
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
      if (node.module in STDLIB) {
        this.globals[node.module] = STDLIB[node.module];
      } else {
        throw new VezeImportError(`модуль "${node.module}" не найден`, node.line);
      }
      return;
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
    const body = this.events[`${event}:${target}`];
    if (body) this.runBlock(body, this.globals);
  }
}

module.exports = Interpreter;

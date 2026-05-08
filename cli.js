#!/usr/bin/env node

const fs          = require('fs');
const path        = require('path');
const Tokenizer   = require('./components/tokenizer');
const Parser      = require('./components/parser');
const Interpreter = require('./components/interpreter');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Использование: vezelang <файл.vz>');
  console.log('Пример:        vezelang main.vz');
  process.exit(1);
}

const filePath = path.resolve(args[0]);

if (!fs.existsSync(filePath)) {
  console.log(`❌ VezeImportError: файл "${args[0]}" не найден`);
  process.exit(1);
}

if (!filePath.endsWith('.vz')) {
  console.log(`❌ VezeSyntaxError: файл должен иметь расширение .vz`);
  process.exit(1);
}

try {
  const code   = fs.readFileSync(filePath, 'utf8');
  const tokens = new Tokenizer(code).tokenize();
  const ast    = new Parser(tokens).parse();
  new Interpreter().run(ast);
} catch (err) {
  if (err.name.startsWith('Veze')) {
    console.log(err.message);
  } else {
    console.log('❌ Внутренняя ошибка:', err.message);
  }
  process.exit(1);
}

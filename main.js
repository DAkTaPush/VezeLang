const fs          = require('fs');
const Tokenizer   = require('./components/tokenizer');
const Parser      = require('./components/parser');
const Interpreter = require('./components/interpreter');

try {
  const code   = fs.readFileSync('test.vz', 'utf8');
  const tokens = new Tokenizer(code).tokenize();
  const ast    = new Parser(tokens).parse();
  new Interpreter().run(ast);
} catch (err) {
  if (err.name.startsWith('Veze')) {
    console.log(err.message);
  } else {
    console.log('❌ Внутренняя ошибка:', err.message);
  }
}

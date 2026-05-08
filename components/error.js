class VezeSyntaxError extends Error {
  constructor(message, line) {
    super(`❌ VezeSyntaxError: ${message} → строка ${line}`);
    this.name = 'VezeSyntaxError';
    this.line = line;
  }
}

class VezeRuntimeError extends Error {
  constructor(message, line) {
    const loc = line != null ? ` → строка ${line}` : '';
    super(`❌ VezeRuntimeError: ${message}${loc}`);
    this.name = 'VezeRuntimeError';
    this.line = line;
  }
}

class VezeImportError extends Error {
  constructor(message, line) {
    const loc = line != null ? ` → строка ${line}` : '';
    super(`❌ VezeImportError: ${message}${loc}`);
    this.name = 'VezeImportError';
    this.line = line;
  }
}

class VezeTypeError extends Error {
  constructor(message, line) {
    const loc = line != null ? ` → строка ${line}` : '';
    super(`❌ VezeTypeError: ${message}${loc}`);
    this.name = 'VezeTypeError';
    this.line = line;
  }
}

module.exports = { VezeSyntaxError, VezeRuntimeError, VezeImportError, VezeTypeError };

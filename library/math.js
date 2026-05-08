// VezeLang — библиотека math
// Математические функции

module.exports = {
    add: (x, y) => x + y,
    subtract: (x, y) => x - y,
    multiply: (x, y) => x * y,
    divide: (x, y) => {
        if (y === 0) throw new Error('деление на ноль');
        return x / y;
    },
    sqrt: (x) => Math.sqrt(x),
    abs: (x) => Math.abs(x),
    round: (x) => Math.round(x),
    floor: (x) => Math.floor(x),
    ceil: (x) => Math.ceil(x),
    PI: Math.PI
};

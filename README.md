# VezeLang 🚀
**Very Easy Language** — язык программирования где каждая строка читается как английское предложение.

## Установка
```
npm install -g .
```

## Использование
```
vezelang <файл.vz>
```

## 🖥️ Пример кода

```vezeLang
import window
import ui12

ui12.background = "#1e1e2e"
ui12.color = "#ffffff"
ui12.borderRadius = 8

name = "VezeLang"
show name in window

func add(x, y) => {
    return x + y
}

result = add(10, 20)
show result in window

on click("Запустить") => {
    show "Привет из VezeLang!" in window
}
```

## 📁 Структура проекта

```
VezeLang/
├── cli.js
├── main.js
├── test.vz
├── components/
│   ├── tokenizer.js
│   ├── parser.js
│   ├── interpreter.js
│   └── error.js
├── library/
│   ├── math.js
│   ├── window.js
│   └── ui12.js
├── examples/
│   ├── showcase.vz
│   ├── click-test.vz
│   └── ui12-test.vz
└── docs/
    ├── specification.md
    ├── AboutLang.md
    ├── Done.md
    └── Task.md
```

## 15 правил языка
1. Вывод: `show X in Y`
2. Переменная: `x = y`
3. Условие: `if x is 0 [ ]`
4. Булево: `if isReady [ ]`
5. Событие: `on click("btn") => { }`
6. Импорт: `import math`
7. Блок кода: `{ }`
8. Функция: `func name(x, y) => { }`
9. Циклы: `repeat N times => { }`
10. Зарезервированные слова
11. Return: `return x + y`
12. Ошибки: `try { } catch error [ ]`
13. Списки и объекты: `items[0]` / `state.current`
14. Режимы вывода: `show X in console` / `show X in window`
15. Элементы интерфейса: `on input()` / `on card()` / `on alert()`

## Версия
0.1.0

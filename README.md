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

## Пример кода
```
import window

name = "VezeLang"
show name in window.center

func add(x, y) => {
    return x + y
}

result = add(10, 20)
show result in window.center
```

## 13 правил языка
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

## Версия
0.1.0

# Спецификация VezeLang
Версия 0.1

## Главный принцип
Каждая строка кода читается как английское предложение.

## 13 Правил

1. Вывод: show X in Y
   show "Привет" in window.center

2. Переменная: x = y
   name = "Алишер"
   age = 18
   isReady = true

3. Условие: if x is 0 [ ]
   if age is 18 [
       show "Добро пожаловать" in window.center
   ]
   else [
       show "Доступ закрыт" in window.center
   ]

4. Булево: if isReady [ ] / if not isReady [ ]
   if isReady [
       show "Готово" in window.center
   ]
   if not isReady [
       show "Не готово" in window.center
   ]

5. Событие: on click("btn") => { }
   on click("=") => { }
   on type("input") => { }
   on load(window) => { }

6. Импорт:
   import math
   import window
   import from "style.vz"
   import from "./style.vz"
   import from "./styles/main.vz"

7. Блок кода: { }

8. Функция: func name(x, y) => { }
   func add(x, y) => {
       return x + y
   }
   result = add(1, 2)

9. Циклы:
   repeat 5 times => {
       show "Привет" in window.center
   }
   for each item in items => {
       show item in window.center
   }

10. Зарезервированные слова — нельзя использовать как имена переменных:
    window, math, show, import, func,
    on, if, else, repeat, for, each, in,
    true, false, not, is, times, from,
    try, catch, return, error

11. Return: return x + y
    func add(x, y) => {
        return x + y
    }

12. Обработка ошибок:
    try {
        result = add(x, y)
    }
    catch error [
        show error in window.center
    ]

13. Списки и объекты:
    items = [1, 2, 3]
    first = items[0]

    state = { current: 0, total: 0 }
    x = state.current

## Комментарии
#{ это комментарий }
x = 5  #{ встроенный комментарий }

## Типы данных
Типы определяются автоматически:
x = 5          #{ число }
y = "привет"   #{ строка }
isReady = true #{ булево }
items = [1, 2] #{ список }

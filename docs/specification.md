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

14. Режимы вывода:
    show X in console  #{ вывод в терминал }
    show X in window   #{ вывод в Electron окно }

    Если в файле есть import window — запускается Electron окно.
    Если нет — работает в терминале.

    Позиционирование элементов — через библиотеку ui12.

15. Элементы интерфейса:
    on click("btn") => { }                    #{ кнопка — только с import window }
    on input("Введи") => { }                  #{ поле ввода — окно или терминал }
    on card("Title", "Text") => { }           #{ карточка — только с import window }
    on alert("Текст") => { }                  #{ предупреждение — окно или терминал }

    Без import window:
    - on click()  → VezeRuntimeError
    - on input()  → readline в терминале
    - on alert()  → console.warn в терминале
    - on card()   → VezeRuntimeError

## ui12 — библиотека стилей

### ui12 v0.3 — анимации
    ui12.hoverButtonBackground = "#6a9fd8"  #{ цвет кнопки при наведении }
    ui12.hoverButtonScale = 1.05            #{ масштаб кнопки при наведении }
    ui12.activeButtonScale = 0.95           #{ масштаб кнопки при нажатии }
    ui12.fadeInDuration = 0.3               #{ длительность fadeIn (секунды) }
    ui12.fadeOutDuration = 0.3              #{ длительность fadeOut (секунды) }
    ui12.zoomDuration = 0.3                 #{ длительность zoom (секунды) }
    ui12.zoomScale = 1.1                    #{ масштаб zoom }
    ui12.animationEasing = "ease"           #{ тип анимации }

    Все элементы получают анимации автоматически:
    - Текст (.item):   fadeIn при появлении
    - Кнопки (button): hover (цвет + масштаб) + active (сжатие)
    - Карточки (.card): zoom при наведении

    CSS-классы: .fade-in, .fade-out, .zoom-in

## Комментарии
#{ это комментарий }
x = 5  #{ встроенный комментарий }

## Типы данных
Типы определяются автоматически:
x = 5          #{ число }
y = "привет"   #{ строка }
isReady = true #{ булево }
items = [1, 2] #{ список }

# VezeLang — Официальная документация v1.0

## О языке

VezeLang (Very Easy Language) — язык программирования, созданный с одним принципом:
**каждая строка кода читается как английское предложение.**

| Параметр        | Значение                                         |
|-----------------|--------------------------------------------------|
| Версия          | 1.0                                              |
| Платформа       | Windows, macOS, Linux                            |
| Режимы          | Терминал и десктопное окно (Electron)            |
| Аудитория       | Новички, дети, люди без опыта. В будущих версиях — поддержка для опытных разработчиков |

## Установка

```
npm install -g .
vezelang <файл.vz>
```

---

## 15 правил языка

### 1. Вывод

```
show "Привет" in console
show "Привет" in window
```

### 2. Переменная

```
name = "Алишер"
age = 18
isReady = true
```

### 3. Условие

```
if age is 18 [
    show "Добро пожаловать" in console
]
else [
    show "Доступ закрыт" in console
]

if x > 20 [ ]   #{ больше }
if x < 20 [ ]   #{ меньше }
if x >= 20 [ ]  #{ больше или равно }
if x <= 20 [ ]  #{ меньше или равно }
if x != 20 [ ]  #{ не равно }
```

### 4. Булево

```
if isReady [
    show "Готово" in console
]
if not isReady [
    show "Не готово" in console
]
```

### 5. Событие

```
on click("btn") => { }
on input("Введи имя") => { }
on load(window) => { }
```

### 6. Импорт

```
import math
import window
import from "./file.vz"
import from "./styles/main.vz"
```

### 7. Блок кода

```
{
    #{ код здесь }
}
```

### 8. Функция

```
func add(x, y) => {
    return x + y
}
result = add(10, 20)
```

### 9. Циклы

```
repeat 5 times => {
    show "Привет" in console
}

for each item in items => {
    show item in console
}
```

### 10. Зарезервированные слова

```
window, math, show, import, func, on, if, else,
repeat, for, each, in, true, false, not, is,
times, from, try, catch, return, error
```

Нельзя использовать как имена переменных.

### 11. Return

```
func add(x, y) => {
    return x + y
}
```

### 12. Обработка ошибок

```
try {
    result = add(x, y)
}
catch error [
    show error in console
]
```

### 13. Списки и объекты

```
items = [1, 2, 3]
first = items[0]

state = { current: 0, total: 0 }
x = state.current
```

### 14. Режимы вывода

```
show X in console   #{ терминал }
show X in window    #{ Electron окно }
```

Если в файле есть `import window` — запускается Electron окно.
Если нет — всё работает в терминале.

### 15. Элементы интерфейса

```
on click("btn") => { }              #{ кнопка — только с import window }
on input("Введи имя") => { }        #{ поле ввода — окно или терминал }
on card("Title", "Text") => { }     #{ карточка — только с import window }
on alert("Текст") => { }            #{ предупреждение — окно или терминал }
```

Без `import window`:

| Элемент     | Поведение                      |
|-------------|-------------------------------|
| on click()  | VezeRuntimeError              |
| on input()  | readline в терминале           |
| on alert()  | console.warn в терминале       |
| on card()   | VezeRuntimeError              |

---

## Комментарии

```
#{ это комментарий }
x = 5  #{ встроенный комментарий }
```

## Типы данных

Типы определяются автоматически:

```
x = 5          #{ число }
y = "привет"   #{ строка }
isReady = true #{ булево }
items = [1, 2] #{ список }
obj = { k: 1 } #{ объект }
```

---

## Библиотеки

### math

```
import math
```

```
#{ Простые операции — не требуют math }
result = 10 + 20
result = 10 * 5

#{ math нужен для сложных функций }
x = math.sqrt(144)     #{ результат: 12 }
y = math.round(3.7)    #{ результат: 4 }
z = math.abs(-5)       #{ результат: 5 }
pi = math.PI           #{ результат: 3.14159... }
a = math.floor(4.9)    #{ результат: 4 }
b = math.ceil(4.1)     #{ результат: 5 }
```

| Функция              | Описание              |
|---------------------|-----------------------|
| add(x, y)           | Сложение              |
| subtract(x, y)      | Вычитание             |
| multiply(x, y)      | Умножение             |
| divide(x, y)        | Деление               |
| sqrt(x)             | Квадратный корень     |
| abs(x)              | Абсолютное значение   |
| round(x)            | Округление            |
| floor(x)            | Округление вниз       |
| ceil(x)             | Округление вверх      |
| PI                  | Число π ≈ 3.14159     |

### window

```
import window
```

Открывает Electron окно. Используется совместно с `show X in window` и событиями интерфейса.

### ui12

```
import ui12
```

Управляет стилями, компонентами и анимациями окна.
Все свойства задаются через `ui12.свойство = значение`.

---

## ui12 — полный справочник свойств

### v0.1 — Стили окна

```
ui12.background = "#ffffff"     #{ цвет фона }
ui12.color = "#000000"          #{ цвет текста }
ui12.fontSize = 20              #{ размер шрифта (px) }
ui12.fontFamily = "Arial"       #{ шрифт }
ui12.position = "center"        #{ выравнивание: center | left | right }
ui12.padding = 10               #{ внутренний отступ (px) }
ui12.margin = 8                 #{ внешний отступ элементов (px) }
ui12.borderRadius = 0           #{ скругление углов (px) }
```

### v0.1 — Стили кнопок

```
ui12.buttonBackground = "#e0e0e0"   #{ фон кнопки }
ui12.buttonColor = "#000000"        #{ цвет текста кнопки }
ui12.buttonFontSize = 16            #{ размер шрифта кнопки (px) }
```

### v0.2 — Стили input

```
ui12.inputBackground = "#ffffff"    #{ фон поля ввода }
ui12.inputColor = "#000000"         #{ цвет текста поля }
ui12.inputBorderColor = "#cccccc"   #{ цвет рамки }
ui12.inputFontSize = 16             #{ размер шрифта (px) }
```

### v0.2 — Стили card

```
ui12.cardBackground = "#ffffff"     #{ фон карточки }
ui12.cardColor = "#000000"          #{ цвет текста карточки }
ui12.cardBorderRadius = 8           #{ скругление углов карточки (px) }
ui12.cardPadding = 16               #{ внутренний отступ карточки (px) }
```

### v0.2 — Стили alert

```
ui12.alertBackground = "#ff4444"    #{ фон предупреждения }
ui12.alertColor = "#ffffff"         #{ цвет текста предупреждения }
ui12.alertBorderRadius = 4          #{ скругление (px) }
```

### v0.3 — Анимации

```
ui12.hoverButtonBackground = "#6a9fd8"  #{ цвет кнопки при наведении }
ui12.hoverButtonScale = 1.05            #{ масштаб кнопки при наведении }
ui12.activeButtonScale = 0.95           #{ масштаб кнопки при нажатии }
ui12.fadeInDuration = 0.3               #{ длительность fadeIn (сек) }
ui12.fadeOutDuration = 0.3              #{ длительность fadeOut (сек) }
ui12.zoomDuration = 0.3                 #{ длительность zoom-перехода (сек) }
ui12.zoomScale = 1.1                    #{ масштаб zoom }
ui12.animationEasing = "ease"           #{ тип анимации: ease | linear | ease-in-out }
```

Все элементы получают анимации автоматически:

| Элемент         | Анимация                              |
|-----------------|---------------------------------------|
| Текст (.item)   | fadeIn при появлении                  |
| Кнопки          | hover (цвет + масштаб) + active сжатие |
| Карточки (.card)| zoom при наведении                    |

CSS-классы доступны напрямую: `.fade-in`, `.fade-out`, `.zoom-in`

---

## Типы ошибок

| Тип                | Когда возникает                          |
|--------------------|------------------------------------------|
| VezeSyntaxError    | Неверный синтаксис                       |
| VezeRuntimeError   | Ошибка во время выполнения               |
| VezeImportError    | Модуль или файл не найден                |
| VezeTypeError      | Несовместимые типы данных                |

---

## Пример: Hello World

```
show "Привет, мир!" in console
```

## Пример: Калькулятор

```
import window
import ui12
import math

ui12.background = "#1e1e2e"
ui12.color = "#cdd6f4"
ui12.buttonBackground = "#89b4fa"
ui12.buttonColor = "#1e1e2e"

state = { current: 0, total: 0 }

on load(window) => {
    show "Калькулятор" in window
}

on click("1") => { state.current = 1 }
on click("2") => { state.current = 2 }
on click("3") => { state.current = 3 }

on click("=") => {
    if state.current is 0 [
        show "Введи число" in window
    ]
    else [
        state.total = math.add(state.total, state.current)
        show state.total in window
        state.current = 0
    ]
}

on click("√") => {
    result = math.sqrt(state.total)
    show result in window
}

on click("C") => {
    state.total = 0
    state.current = 0
    show "Сброс" in window
}
```

## Пример: Десктопное приложение

```
import window
import ui12

ui12.background = "#1e1e2e"
ui12.color = "#cdd6f4"
ui12.buttonBackground = "#89b4fa"
ui12.buttonColor = "#1e1e2e"
ui12.cardBackground = "#313244"
ui12.cardColor = "#cdd6f4"
ui12.cardBorderRadius = 12
ui12.hoverButtonBackground = "#74c7ec"

show "Добро пожаловать в VezeLang!" in window

on card("О языке", "Каждая строка читается как предложение") => {
    show "Это VezeLang v1.0" in window
}

on input("Введи своё имя") => {
    show "Привет!" in window
}

on click("Начать") => {
    show "Поехали!" in window
}
```

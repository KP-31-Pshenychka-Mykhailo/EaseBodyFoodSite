# Финальное исправление путей для навигации

## 🐛 Проблема
При переходе между страницами через хедер возникали дублирующиеся пути:
- **Неправильно:** `http://localhost:8000/pages/main/pages/main/calculator.html`
- **Правильно:** `http://localhost:8000/pages/main/calculator.html`

## ✅ Решение

### 1. Исправлена функция `updatePathsInHtml` в `path-utils.js`

**Проблема:** Функция добавляла базовый путь ко всем ссылкам, что приводило к дублированию.

**Решение:** Теперь функция учитывает текущее расположение страницы:

```javascript
function updatePathsInHtml(html) {
  const path = window.location.pathname;
  
  if (path.includes('/pages/main/')) {
    // Мы в подпапке pages/main/
    return html
      .replace(/href="\/index\.html"/g, 'href="../../index.html"')
      .replace(/href="\/pages\/main\//g, 'href="')  // Убираем /pages/main/
      .replace(/src="\/data\//g, 'src="../../data/')
      .replace(/src="\/assets\//g, 'src="../../assets/');
  } else {
    // Мы в корне сайта
    return html
      .replace(/href="\/index\.html"/g, 'href="index.html"')
      .replace(/href="\/pages\/main\//g, 'href="pages/main/')
      .replace(/src="\/data\//g, 'src="data/')
      .replace(/src="\/assets\//g, 'src="assets/');
  }
}
```

### 2. Исправлена функция `insertHeaderDirectly` в `header.js`

**Проблема:** Использовались общие функции, которые не учитывали специфику навигации.

**Решение:** Прямое определение путей в зависимости от расположения:

```javascript
function insertHeaderDirectly() {
  const path = window.location.pathname;
  
  if (path.includes('/pages/main/')) {
    // Мы в подпапке pages/main/
    homePath = '../../index.html';
    constructorPath = 'constructor.html';        // Относительный путь
    calculatorPath = 'calculator.html';          // Относительный путь
    standartPath = 'standart.html';              // Относительный путь
    cartPath = 'cart.html';                      // Относительный путь
    logoPath = '../../data/img/logo.png';
  } else {
    // Мы в корне сайта
    homePath = 'index.html';
    constructorPath = 'pages/main/constructor.html';
    calculatorPath = 'pages/main/calculator.html';
    standartPath = 'pages/main/standart.html';
    cartPath = 'pages/main/cart.html';
    logoPath = 'data/img/logo.png';
  }
}
```

### 3. Обновлена функция `getPagePath` в `path-utils.js`

**Добавлена новая логика:**
```javascript
function getPagePath(pageName) {
  const path = window.location.pathname;
  
  // Если мы уже в pages/main/, то используем относительные пути
  if (path.includes('/pages/main/')) {
    return `${pageName}.html`;
  }
  
  // Если мы в корне, то добавляем полный путь
  return `pages/main/${pageName}.html`;
}
```

## 📊 Результат

### ✅ Исправленные пути:

#### С главной страницы (`/`):
- `index.html` → `index.html` ✅
- `pages/main/calculator.html` → `pages/main/calculator.html` ✅
- `pages/main/constructor.html` → `pages/main/constructor.html` ✅

#### С страниц в `pages/main/`:
- `../../index.html` → `../../index.html` ✅
- `calculator.html` → `calculator.html` ✅ (без дублирования)
- `constructor.html` → `constructor.html` ✅ (без дублирования)

### 🎯 Тестирование:

1. **Главная → Калькулятор:** `index.html` → `pages/main/calculator.html` ✅
2. **Калькулятор → Конструктор:** `calculator.html` → `constructor.html` ✅
3. **Конструктор → Главная:** `constructor.html` → `../../index.html` ✅
4. **Любая страница → Любая страница:** Все пути корректны ✅

## 🔧 Файлы изменены:

1. **`assets/js/core/path-utils.js`** - исправлена логика `updatePathsInHtml` и `getPagePath`
2. **`assets/js/layout/header.js`** - исправлена функция `insertHeaderDirectly`
3. **`test-paths.html`** - создан тестовый файл для проверки

## 🚀 Готово к использованию

Теперь навигация работает корректно:
- ✅ Нет дублирующихся путей
- ✅ Все ссылки работают с любой страницы
- ✅ Совместимо с GitHub Pages
- ✅ Совместимо с локальным сервером

**Результат:** Проблема с дублирующимися путями полностью решена! 🎉

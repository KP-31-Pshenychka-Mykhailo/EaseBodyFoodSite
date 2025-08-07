#!/usr/bin/env node

/**
 * Скрипт для проверки путей в проекте
 * Запуск: node check-paths.js
 */

const fs = require('fs');
const path = require('path');

// Функция для поиска файлов с определенным расширением
function findFiles(dir, extensions) {
    const files = [];
    
    function traverse(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                traverse(fullPath);
            } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
                files.push(fullPath);
            }
        }
    }
    
    traverse(dir);
    return files;
}

// Функция для поиска проблемных путей в файле
function checkFilePaths(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const issues = [];
    
    const problematicPatterns = [
        /href=["']\/data\//g,
        /src=["']\/data\//g,
        /href=["']\/assets\//g,
        /src=["']\/assets\//g
    ];
    
    lines.forEach((line, index) => {
        problematicPatterns.forEach(pattern => {
            const matches = line.match(pattern);
            if (matches) {
                issues.push({
                    line: index + 1,
                    content: line.trim(),
                    pattern: pattern.source
                });
            }
        });
    });
    
    return issues;
}

// Основная функция
function main() {
    console.log('🔍 Проверка путей в проекте...\n');
    
    const htmlFiles = findFiles('.', ['.html']);
    const jsFiles = findFiles('.', ['.js']);
    
    let totalIssues = 0;
    
    // Проверяем HTML файлы
    console.log('📄 HTML файлы:');
    htmlFiles.forEach(file => {
        const issues = checkFilePaths(file);
        if (issues.length > 0) {
            console.log(`\n❌ ${file}:`);
            issues.forEach(issue => {
                console.log(`   Строка ${issue.line}: ${issue.content}`);
                totalIssues++;
            });
        }
    });
    
    // Проверяем JS файлы
    console.log('\n📜 JavaScript файлы:');
    jsFiles.forEach(file => {
        const issues = checkFilePaths(file);
        if (issues.length > 0) {
            console.log(`\n❌ ${file}:`);
            issues.forEach(issue => {
                console.log(`   Строка ${issue.line}: ${issue.content}`);
                totalIssues++;
            });
        }
    });
    
    console.log(`\n📊 Результат: найдено ${totalIssues} проблемных путей`);
    
    if (totalIssues === 0) {
        console.log('✅ Все пути корректны!');
    } else {
        console.log('⚠️  Рекомендуется исправить найденные проблемы');
    }
}

main();

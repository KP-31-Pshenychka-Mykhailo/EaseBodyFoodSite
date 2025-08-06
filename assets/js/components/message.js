/**
 * Message Tooltip Component
 * Универсальный компонент для отображения сообщений-плашек
 */
class MessageTooltip {
    constructor() {
        this.triggerBtn = null;
        this.messageTooltip = null;
        this.autoHideTimeout = null;
        this.currentDesign = 'default'; // 'default' или 'alt'
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.triggerBtn = document.getElementById('star-menu-btn');
            this.messageTooltip = document.getElementById('message-tooltip');
            
            if (this.triggerBtn && this.messageTooltip) {
                this.bindEvents();
            }
        });
    }

    bindEvents() {
        // Клик на кнопку-триггер
        this.triggerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.showTooltip();
        });
        
        // Закрыть плашку при клике вне её
        document.addEventListener('click', (e) => {
            if (!this.triggerBtn.contains(e.target) && !this.messageTooltip.contains(e.target)) {
                this.hideTooltip();
            }
        });
    }

    showTooltip() {
        // Очистить предыдущий таймер если он есть
        if (this.autoHideTimeout) {
            clearTimeout(this.autoHideTimeout);
        }
        
        // Показать плашку
        this.messageTooltip.classList.add('show');
        
        // Автоматически скрыть через 1.75 секунды
        this.autoHideTimeout = setTimeout(() => {
            this.hideTooltip();
        }, 1750);
    }

    hideTooltip() {
        this.messageTooltip.classList.remove('show');
        
        // Очистить таймер при ручном закрытии
        if (this.autoHideTimeout) {
            clearTimeout(this.autoHideTimeout);
            this.autoHideTimeout = null;
        }
    }
}

// Инициализация компонента
new MessageTooltip(); 
/**
 * Universal Message System
 * Универсальная система сообщений для замены alert()
 */
class MessageSystem {
    constructor() {
        this.container = null;
        this.messageQueue = [];
        this.isShowing = false;
        this.init();
    }

    init() {
        this.createContainer();
        this.attachStyles();
    }

    createContainer() {
        // Создаем контейнер для сообщений если его еще нет
        if (!document.getElementById('message-system-container')) {
            this.container = document.createElement('div');
            this.container.id = 'message-system-container';
            this.container.style.cssText = `
                position: fixed;
                top: 100px;
                right: 0;
                z-index: 10000;
                pointer-events: none;
            `;
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('message-system-container');
        }
    }

    attachStyles() {
        // Проверяем, подключены ли уже стили для сообщений
        if (!document.getElementById('message-system-styles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'message-system-styles';
            styleSheet.textContent = `
                .message-notification {
                    position: relative;
                    right: -300px;
                    margin-bottom: 12px;
                    padding: 16px 24px;
                    font-family: 'Montserrat', sans-serif;
                    font-weight: 500;
                    font-size: 16px;
                    max-width: 400px;
                    text-align: center;
                    border-radius: 22px 0 0 22px;
                    pointer-events: auto;
                    cursor: pointer;
                    transition: all 0.4s ease-out;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }

                .message-notification.success {
                    background: #4CAF50;
                    color: white;
                    border: 2px solid #fff;
                }

                .message-notification.error {
                    background: #f44336;
                    color: white;
                    border: 2px solid #fff;
                }

                .message-notification.warning {
                    background: #ff9800;
                    color: white;
                    border: 2px solid #fff;
                }

                .message-notification.info {
                    background: #fff;
                    color: #4CAF50;
                    border: 2px solid #4CAF50;
                }

                .message-notification.show {
                    right: 0;
                }

                @media (max-width: 768px) {
                    .message-notification {
                        max-width: 300px;
                        padding: 12px 20px;
                        font-size: 14px;
                        border-radius: 16px 0 0 16px;
                    }
                }

                @media (max-width: 480px) {
                    .message-notification {
                        max-width: 250px;
                        padding: 10px 16px;
                        font-size: 13px;
                        border-radius: 12px 0 0 12px;
                    }
                }
            `;
            document.head.appendChild(styleSheet);
        }
    }

    show(message, type = 'info', duration = 3000) {
        const messageElement = document.createElement('div');
        messageElement.className = `message-notification ${type}`;
        messageElement.textContent = message;
        
        // Добавляем в контейнер
        this.container.appendChild(messageElement);
        
        // Показываем с анимацией
        requestAnimationFrame(() => {
            messageElement.classList.add('show');
        });

        // Закрытие по клику
        messageElement.addEventListener('click', () => {
            this.hide(messageElement);
        });

        // Автоматическое скрытие
        setTimeout(() => {
            this.hide(messageElement);
        }, duration);

        return messageElement;
    }

    hide(messageElement) {
        if (messageElement && messageElement.parentNode) {
            messageElement.classList.remove('show');
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, 400);
        }
    }

    // Методы для разных типов сообщений
    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 4000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 3500) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }
}

/**
 * Legacy MessageTooltip для совместимости со старым кодом
 */
class MessageTooltip {
    constructor() {
        this.triggerBtn = null;
        this.messageTooltip = null;
        this.autoHideTimeout = null;
        this.currentDesign = 'default';
        this.init();
    }

    init() {
        const initMessage = () => {
            this.triggerBtn = document.getElementById('star-menu-btn');
            this.messageTooltip = document.getElementById('message-tooltip');
            
            if (this.triggerBtn && this.messageTooltip) {
                this.bindEvents();
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initMessage);
        } else {
            initMessage();
        }
    }

    bindEvents() {
        this.triggerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.showTooltip();
        });
        
        document.addEventListener('click', (e) => {
            if (!this.triggerBtn.contains(e.target) && !this.messageTooltip.contains(e.target)) {
                this.hideTooltip();
            }
        });
    }

    showTooltip() {
        if (this.autoHideTimeout) {
            clearTimeout(this.autoHideTimeout);
        }
        
        this.messageTooltip.classList.add('show');
        
        this.autoHideTimeout = setTimeout(() => {
            this.hideTooltip();
        }, 1750);
    }

    hideTooltip() {
        this.messageTooltip.classList.remove('show');
        
        if (this.autoHideTimeout) {
            clearTimeout(this.autoHideTimeout);
            this.autoHideTimeout = null;
        }
    }
}

// Глобальная инициализация
const messageSystem = new MessageSystem();
new MessageTooltip();

// Создаем глобальную функцию для замены alert
window.showMessage = function(message, type = 'info') {
    messageSystem.show(message, type);
};

// Альтернативные методы
window.showSuccess = function(message) {
    messageSystem.success(message);
};

window.showError = function(message) {
    messageSystem.error(message);
};

window.showWarning = function(message) {
    messageSystem.warning(message);
};

window.showInfo = function(message) {
    messageSystem.info(message);
}; 
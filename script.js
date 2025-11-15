/**
 * Лабораторная работа 6.a + 6.b
 * Класс для работы с заказами на ремонт мебели
 */

// Текущий пользователь (легко конфигурируемое состояние)
let currentUser = 'Иван Петров';

// Основной класс для работы с заказами
class FurnitureRepairService {
    constructor(orders = []) {
        this._orders = orders;
        this._nextId = orders.length > 0 ? Math.max(...orders.map(order => parseInt(order.id))) + 1 : 1;
    }

    /**
     * Получить массив заказов с пагинацией и фильтрацией
     */
    getOrders(skip = 0, top = 10, filterConfig = {}) {
        let filteredOrders = [...this._orders];
        
        // Применяем фильтры
        if (filterConfig.status) {
            filteredOrders = filteredOrders.filter(order => 
                order.status.toLowerCase().includes(filterConfig.status.toLowerCase())
            );
        }
        
        if (filterConfig.author) {
            filteredOrders = filteredOrders.filter(order => 
                order.author.toLowerCase().includes(filterConfig.author.toLowerCase())
            );
        }
        
        if (filterConfig.furnitureType) {
            filteredOrders = filteredOrders.filter(order => 
                order.furnitureType.toLowerCase().includes(filterConfig.furnitureType.toLowerCase())
            );
        }
        
        // Сортировка по дате создания (новые сначала)
        filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Пагинация
        return filteredOrders.slice(skip, skip + top);
    }

    /**
     * Получить заказ по ID
     */
    getOrder(id) {
        return this._orders.find(order => order.id === id);
    }

    /**
     * Проверить валидность заказа
     */
    _validateOrder(order) {
        if (!order.id || typeof order.id !== 'string') return false;
        if (!order.description || order.description.length > 200) return false;
        if (!order.createdAt || !(order.createdAt instanceof Date)) return false;
        if (!order.author || order.author.trim() === '') return false;
        if (order.photoLink && typeof order.photoLink !== 'string') return false;
        if (!order.furnitureType || order.furnitureType.trim() === '') return false;
        if (!order.status || order.status.trim() === '') return false;
        if (typeof order.cost !== 'number' || order.cost < 0) return false;
        
        return true;
    }

    /**
     * Добавить новый заказ
     */
    addOrder(order) {
        const newOrder = {
            id: this._nextId.toString(),
            createdAt: new Date(),
            ...order
        };
        
        if (this._validateOrder(newOrder)) {
            this._orders.push(newOrder);
            this._nextId++;
            return true;
        }
        return false;
    }

    /**
     * Редактировать заказ
     */
    editOrder(id, updates) {
        const orderIndex = this._orders.findIndex(order => order.id === id);
        if (orderIndex === -1) return false;
        
        const updatedOrder = {
            ...this._orders[orderIndex],
            ...updates
        };
        
        // Запрещаем изменение ID, автора и даты создания
        updatedOrder.id = this._orders[orderIndex].id;
        updatedOrder.author = this._orders[orderIndex].author;
        updatedOrder.createdAt = this._orders[orderIndex].createdAt;
        
        if (this._validateOrder(updatedOrder)) {
            this._orders[orderIndex] = updatedOrder;
            return true;
        }
        return false;
    }

    /**
     * Удалить заказ
     */
    removeOrder(id) {
        const orderIndex = this._orders.findIndex(order => order.id === id);
        if (orderIndex !== -1) {
            this._orders.splice(orderIndex, 1);
            return true;
        }
        return false;
    }

    /**
     * Добавить несколько заказов
     */
    addAll(orders) {
        const invalidOrders = [];
        
        orders.forEach(order => {
            if (!this.addOrder(order)) {
                invalidOrders.push(order);
            }
        });
        
        return invalidOrders;
    }

    /**
     * Очистить все заказы
     */
    clear() {
        this._orders = [];
        this._nextId = 1;
    }

    /**
     * Получить все заказы (для отладки)
     */
    getAllOrders() {
        return [...this._orders];
    }
}

/**
 * Класс для отображения заказов на странице
 */
class OrderView {
    constructor(service) {
        this.service = service;
        this.currentPage = 1;
        this.pageSize = 5;
        this.currentFilter = {};
    }

    /**
     * Отобразить список заказов
     */
    renderOrders() {
        const ordersContainer = document.querySelector('.order-list');
        if (!ordersContainer) return;
        
        const skip = (this.currentPage - 1) * this.pageSize;
        const orders = this.service.getOrders(skip, this.pageSize, this.currentFilter);
        
        ordersContainer.innerHTML = '';
        
        if (orders.length === 0) {
            ordersContainer.innerHTML = '<p>Заказы не найдены</p>';
            return;
        }
        
        orders.forEach(order => {
            const orderElement = this._createOrderElement(order);
            ordersContainer.appendChild(orderElement);
        });
        
        this._renderPagination();
        this._updateUserInterface();
    }

    /**
     * Создать DOM-элемент для заказа
     */
    _createOrderElement(order) {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-card';
        orderDiv.dataset.orderId = order.id;
        
        const formattedDate = order.createdAt.toLocaleDateString('ru-RU');
        const formattedCost = order.cost.toLocaleString('ru-RU', {
            style: 'currency',
            currency: 'RUB'
        });
        
        orderDiv.innerHTML = `
            <h3>Заказ #${order.id} — ${order.furnitureType}</h3>
            <p><strong>Описание:</strong> ${order.description}</p>
            <p><strong>Статус:</strong> ${order.status}</p>
            <p><strong>Стоимость:</strong> ${formattedCost}</p>
            <p><strong>Автор:</strong> ${order.author}</p>
            <p><strong>Создан:</strong> ${formattedDate}</p>
            ${order.photoLink ? `<img src="${order.photoLink}" alt="${order.furnitureType}" style="max-width: 200px; margin-top: 10px;">` : ''}
            <div class="actions">
                ${currentUser === order.author ? `
                    <button onclick="editOrder('${order.id}')">Редактировать</button>
                    <button onclick="deleteOrder('${order.id}')">Удалить</button>
                ` : ''}
                <button onclick="changeStatus('${order.id}')">Изменить статус</button>
            </div>
        `;
        
        return orderDiv;
    }

    /**
     * Отобразить пагинацию
     */
    _renderPagination() {
        // Упрощенная пагинация - в реальном проекте нужно добавить более сложную логику
        console.log('Пагинация: страница', this.currentPage);
    }

    /**
     * Обновить интерфейс в зависимости от пользователя
     */
    _updateUserInterface() {
        const addButton = document.querySelector('button[type="submit"]');
        if (addButton) {
            addButton.textContent = currentUser ? 'Создать заказ' : 'Войдите для создания заказа';
            addButton.disabled = !currentUser;
        }
    }

    /**
     * Применить фильтры
     */
    applyFilters(filterConfig) {
        this.currentFilter = { ...this.currentFilter, ...filterConfig };
        this.currentPage = 1;
        this.renderOrders();
    }

    /**
     * Сбросить фильтры
     */
    clearFilters() {
        this.currentFilter = {};
        this.currentPage = 1;
        this.renderOrders();
    }
}

// Инициализация данных
const initialOrders = [
    {
        id: '1',
        description: 'Ремонт деревянного стула - замена ножки, покраска',
        createdAt: new Date('2024-01-10T10:00:00'),
        author: 'Иван Петров',
        furnitureType: 'Стул',
        status: 'В ремонте',
        cost: 1500,
        photoLink: ''
    },
    {
        id: '2', 
        description: 'Реставрация антикварного стола, полировка поверхности',
        createdAt: new Date('2024-01-12T14:30:00'),
        author: 'Мария Сидорова',
        furnitureType: 'Стол',
        status: 'Выполнен',
        cost: 3500,
        photoLink: ''
    },
    {
        id: '3',
        description: 'Замена обивки дивана, новый наполнитель',
        createdAt: new Date('2024-01-15T09:15:00'),
        author: 'Петр Иванов',
        furnitureType: 'Диван', 
        status: 'Ожидает детали',
        cost: 8000,
        photoLink: ''
    },
    {
        id: '4',
        description: 'Ремонт офисного кресла - замена механизма качания',
        createdAt: new Date('2024-01-18T16:45:00'),
        author: 'Иван Петров',
        furnitureType: 'Кресло',
        status: 'В ремонте',
        cost: 2200,
        photoLink: ''
    },
    {
        id: '5',
        description: 'Восстановление комода, замена ручек, покраска',
        createdAt: new Date('2024-01-20T11:20:00'),
        author: 'Анна Ковалева',
        furnitureType: 'Комод',
        status: 'Оценка',
        cost: 0,
        photoLink: ''
    }
];

// Создаем экземпляры классов
const repairService = new FurnitureRepairService(initialOrders);
const orderView = new OrderView(repairService);

/**
 * Глобальные функции для вызова из консоли
 */
window.addOrder = function(orderData) {
    const newOrder = {
        description: orderData.description || '',
        author: currentUser,
        furnitureType: orderData.furnitureType || 'Другое',
        status: orderData.status || 'Новый',
        cost: orderData.cost || 0,
        photoLink: orderData.photoLink || ''
    };
    
    if (repairService.addOrder(newOrder)) {
        orderView.renderOrders();
        console.log('Заказ успешно добавлен');
        return true;
    } else {
        console.log('Ошибка при добавлении заказа');
        return false;
    }
};

window.editOrder = function(id, updates = {}) {
    // Если updates не переданы, запрашиваем через prompt для демонстрации
    if (Object.keys(updates).length === 0) {
        const newStatus = prompt('Введите новый статус:');
        if (newStatus) {
            updates.status = newStatus;
        }
    }
    
    if (repairService.editOrder(id, updates)) {
        orderView.renderOrders();
        console.log('Заказ успешно обновлен');
        return true;
    } else {
        console.log('Ошибка при обновлении заказа');
        return false;
    }
};

window.deleteOrder = function(id) {
    if (confirm('Вы уверены, что хотите удалить заказ?')) {
        if (repairService.removeOrder(id)) {
            orderView.renderOrders();
            console.log('Заказ успешно удален');
            return true;
        } else {
            console.log('Ошибка при удалении заказа');
            return false;
        }
    }
};

window.changeStatus = function(id) {
    const newStatus = prompt('Введите новый статус заказа:');
    if (newStatus) {
        window.editOrder(id, { status: newStatus });
    }
};

window.filterOrders = function(filterConfig) {
    orderView.applyFilters(filterConfig);
};

window.clearFilters = function() {
    orderView.clearFilters();
};

window.setUser = function(userName) {
    currentUser = userName;
    orderView.renderOrders();
    console.log('Пользователь изменен на:', currentUser);
};

window.getService = function() {
    return repairService;
};

// Дополнительные функции для демонстрации
window.demoAddOrder = function() {
    const demoOrder = {
        description: 'Демонстрационный заказ на ремонт',
        furnitureType: 'Стул',
        status: 'Новый',
        cost: 1000,
        photoLink: ''
    };
    return window.addOrder(demoOrder);
};

window.demoEditOrder = function(id = '1') {
    return window.editOrder(id, { status: 'В ремонте', cost: 1500 });
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Обработчик формы создания заказа
    const orderForm = document.querySelector('form');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!currentUser) {
                alert('Пожалуйста, войдите в систему');
                return;
            }
            
            const formData = new FormData(this);
            const orderData = {
                description: formData.get('description') || this.querySelector('textarea').value,
                furnitureType: formData.get('furnitureType') || this.querySelector('select').value,
                status: 'Новый',
                cost: 0
            };
            
            if (window.addOrder(orderData)) {
                this.reset();
                alert('Заказ успешно создан!');
            }
        });
    }
    
    // Обработчик поиска
    const searchInput = document.querySelector('.search');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchText = e.target.value;
            if (searchText.length >= 2) {
                window.filterOrders({
                    description: searchText
                });
            } else if (searchText.length === 0) {
                window.clearFilters();
            }
        });
    }
    
    // Обработчик сортировки
    const sortButton = document.querySelector('.sort-button');
    if (sortButton) {
        sortButton.addEventListener('click', function() {
            alert('Функция сортировки будет реализована в следующей версии');
        });
    }
    
    // Первоначальная отрисовка заказов
    orderView.renderOrders();
    
    console.log('Система ремонта мебели инициализирована!');
    console.log('Доступные команды:');
    console.log('- addOrder(orderData) - добавить заказ');
    console.log('- editOrder(id, updates) - редактировать заказ');
    console.log('- deleteOrder(id) - удалить заказ');
    console.log('- filterOrders(filterConfig) - фильтровать заказы');
    console.log('- setUser(userName) - сменить пользователя');
    console.log('- demoAddOrder() - демо добавления заказа');
    console.log('- getService() - получить сервис для отладки');
});

// Добавляем стили для динамически создаваемых элементов
const additionalStyles = `
    .order-card {
        transition: all 0.3s ease;
    }
    .order-card:hover {
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        transform: translateY(-2px);
    }
    .actions button {
        margin: 5px;
        padding: 5px 10px;
        font-size: 0.9em;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
import { UserModel } from './model.js';

export class FurnitureRepairController {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.userModel = new UserModel(); // модель пользователей

        this.currentUser = null;
        window.currentUser = null;

        this.skip = 0;
        this.top = 5;
        this.filter = {};
        this.sortField = 'createdAt';
        this.sortOrder = 'desc';

        this._initEvents();
        this.render();
    }

    _initEvents() {
const loginMenu = document.getElementById('loginMenu');
const logoutBtn = document.getElementById('logoutBtn');

// Логин
this.view.loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const { username, password } = this.view.getLoginData();
    const user = this.userModel.checkCredentials(username, password);

    if (!user) {
        alert('Неверный логин или пароль!');
        return;
    }

    this.currentUser = username;
    window.currentUser = username;

    localStorage.setItem('currentUser', username);

    // Меняем текст ссылки меню "Войти" на логин пользователя
    loginMenu.textContent = username;

    // Показываем кнопку выхода
    logoutBtn.style.display = 'inline-block';

    this.skip = 0;
    this.render();
});

// Выход
logoutBtn.addEventListener('click', () => {
    this.currentUser = null;
    window.currentUser = null;

    // Восстанавливаем текст ссылки меню
    loginMenu.textContent = 'Войти';
    logoutBtn.style.display = 'none';

    this.skip = 0;
    this.render();
});
        // Открыть модалку при клике на кнопку "Регистрация"
document.getElementById('showRegister').addEventListener('click', () => {
    document.getElementById('registerModal').style.display = 'flex';
});

// Закрытие модалки по ×
document.querySelector('#registerModal .close').addEventListener('click', () => {
    document.getElementById('registerModal').style.display = 'none';
});

        // Регистрация нового пользователя
        const registerForm = document.getElementById('registerForm');
        registerForm.addEventListener('submit', e => {
            e.preventDefault();
            const username = registerForm.regUsername.value.trim();
            const password = registerForm.regPassword.value;
            const password2 = registerForm.regPassword2.value;

            if (password !== password2) {
                alert('Пароли не совпадают!');
                return;
            }

            const added = this.userModel.addUser(username, password);
            if (!added) {
                alert('Пользователь с таким логином уже существует!');
                return;
            }

            alert('Регистрация прошла успешно! Теперь войдите в систему.');
            registerForm.reset();
            document.getElementById('registerModal').style.display = 'none';
        });

        // Создание заказа
        this.view.orderForm.addEventListener('submit', e => {
            e.preventDefault();
            if (!this.currentUser) {
                alert('Сначала войдите в систему');
                return;
            }
            const data = this.view.getOrderFormData();
            this.model.add(data);
            this.view.clearOrderForm();
            this.skip = 0;
            this.render();
        });

        // Делегирование событий списка заказов
        this.view.listContainer.addEventListener('click', e => {
            const card = e.target.closest('.order-card');
            if (!card) return;
            const id = card.dataset.id;

            if (e.target.classList.contains('delete-btn')) {
                this.model.remove(id);
                this.render();
            }

            if (e.target.classList.contains('edit-btn')) {
                const order = this.model._orders.find(o => o.id === id);
                if (!order) return;
                this.view.openEditModal(order);
            }
        });

        // Сохранение изменений через форму редактирования
        this.view.editForm.addEventListener('submit', e => {
            e.preventDefault();
            if (!this.view.currentEditId) return;
            const updates = this.view.getEditFormData();
            this.model.edit(this.view.currentEditId, updates);
            this.view.closeEditModal();
            this.render();
        });

        // Показать ещё
        this.view.showMoreButton.addEventListener('click', () => {
            this.skip += this.top;
            this.render(true); // append = true
        });

        // Сортировка
        document.querySelector('.sort-button').addEventListener('click', () => {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
            this.skip = 0;
            this.render();
        });

        // Поиск по всем полям
        document.querySelector('.search').addEventListener('input', e => {
        const text = e.target.value.toLowerCase();
        this.filter = { text };
        this.skip = 0;
        this.render(); 
});
    }

    render(append = false) {
    if (!this.currentUser) {
        this.view.renderOrders([], append);
        return;
    }

    const orders = this.model.getOrders(
        this.skip,
        this.top,
        { ...this.filter, author: this.currentUser }, // фильтр по текущему пользователю
        this.sortField,
        this.sortOrder
    );

    this.view.renderOrders(orders, append);
}

}
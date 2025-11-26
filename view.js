export class FurnitureRepairView {
    constructor() {
        this.listContainer = document.querySelector('.order-list');
        this.loginForm = document.querySelector('#login form');
        this.orderForm = document.querySelector('#order form');

        this.showMoreButton = document.createElement('button');
        this.showMoreButton.className = 'load-more';
        this.showMoreButton.textContent = 'Показать ещё';
        this.showMoreButton.style.display = 'none';
        this.listContainer.parentNode.appendChild(this.showMoreButton);

        // Модальное окно редактирования
        this.editModal = document.getElementById('editModal');
        this.editForm = document.getElementById('editForm');
        this.editClose = this.editModal.querySelector('.close');
        this.currentEditId = null;

        // Закрытие модалки
        this.editClose.addEventListener('click', () => this.closeEditModal());
        window.addEventListener('click', e => {
            if (e.target === this.editModal) this.closeEditModal();
        });
    }

    openEditModal(order) {
        this.currentEditId = order.id;
        this.editForm.furnitureType.value = order.furnitureType;
        this.editForm.description.value = order.description;
        this.editForm.status.value = order.status;
        this.editForm.cost.value = order.cost;
        this.editModal.style.display = 'flex';
    }

    closeEditModal() {
        this.editModal.style.display = 'none';
        this.currentEditId = null;
        this.editForm.reset();
    }

    getEditFormData() {
        return {
            furnitureType: this.editForm.furnitureType.value,
            description: this.editForm.description.value,
            status: this.editForm.status.value,
            cost: +this.editForm.cost.value
        };
    }

    renderOrders(orders, append = false) {
        if (!append) this.listContainer.innerHTML = '';

        if (orders.length === 0 && !append) {
            this.listContainer.innerHTML = '<p>Нет заказов</p>';
            this.showMoreButton.style.display = 'none';
            return;
        }

        for (const o of orders) {
            const card = document.createElement('div');
            card.className = 'order-card';
            card.dataset.id = o.id;

            card.innerHTML = `
                <h3>Заказ #${o.id} — ${o.furnitureType}</h3>
                <p><strong>Описание:</strong> ${o.description}</p>
                <p><strong>Статус:</strong> ${o.status}</p>
                <p><strong>Стоимость:</strong> ${o.cost} ₽</p>
                <div class="actions">
                    <button class="edit-btn">Редактировать</button>
                    <button class="delete-btn">Удалить</button>
                </div>
            `;

            this.listContainer.appendChild(card);
        }

        this.showMoreButton.style.display = orders.length > 0 ? 'block' : 'none';
    }

    getLoginData() {
        return {
            username: this.loginForm.username.value,
            password: this.loginForm.password.value
        };
    }

    getOrderFormData() {
    return {
        description: this.orderForm.querySelector('textarea').value,
        furnitureType: this.orderForm.querySelector('select').value,
        status: 'Новый',
        cost: 0,
        author: window.currentUser // текущий пользователь
    };
}

    clearOrderForm() {
        this.orderForm.reset();
    }
    setController(controller) {
    this.controller = controller;
    }
}
export class FurnitureRepairModel {
    constructor() {
        this.storageKey = 'repairOrders';
        this._orders = [];
        this._nextId = 1;
    }

    restore() {
    const saved = localStorage.getItem(this.storageKey);

    if (saved) {
        this._orders = JSON.parse(saved).map(order => ({
            ...order,
            createdAt: new Date(order.createdAt)
        }));
        this._nextId = this._orders.length > 0
            ? Math.max(...this._orders.map(o => +o.id)) + 1
            : 1;
    } else {
        // Начальные данные для демонстрации
        this._orders = []; 
        this._nextId = 1;
        this.save();
    }
}
    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this._orders));
    }

    _getInitialOrders() {
        return [
            {
                id: '1',
                description: 'Ремонт деревянного стула',
                createdAt: new Date('2024-01-10'),
                author: 'Иван Петров',
                furnitureType: 'Стул',
                status: 'В ремонте',
                cost: 1500,
                photoLink: ''
            },
            {
                id: '2',
                description: 'Реставрация антикварного стола',
                createdAt: new Date('2024-01-12'),
                author: 'Мария Сидорова',
                furnitureType: 'Стол',
                status: 'Выполнен',
                cost: 3500,
                photoLink: ''
            }
        ];
    }

    getOrders(skip = 0, top = 10, filter = {}, sortField = 'createdAt', sortOrder = 'desc') {
    let list = [...this._orders];

    // фильтр по пользователю
    if (filter.author) {
        const user = filter.author.toLowerCase();
        list = list.filter(o => o.author.toLowerCase() === user);
    }

    // фильтр по тексту (поиск)
    if (filter.text) {
        const txt = filter.text.toLowerCase();
        list = list.filter(o =>
            o.author.toLowerCase().includes(txt) ||
            o.status.toLowerCase().includes(txt) ||
            o.description.toLowerCase().includes(txt) ||
            o.furnitureType.toLowerCase().includes(txt)
        );
    }

    list.sort((a, b) => {
        if (sortOrder === 'asc') return a[sortField] > b[sortField] ? 1 : -1;
        return a[sortField] < b[sortField] ? 1 : -1;
    });

    return list.slice(skip, skip + top);
}

    add(order) {
        const newOrder = {
            id: this._nextId.toString(),
            createdAt: new Date(),
            ...order
        };

        this._orders.push(newOrder);
        this._nextId++;
        this.save();
        return true;
    }

    edit(id, updates) {
        const idx = this._orders.findIndex(o => o.id === id);
        if (idx === -1) return false;

        this._orders[idx] = {
            ...this._orders[idx],
            ...updates,
            id: this._orders[idx].id,
            createdAt: this._orders[idx].createdAt,
        };

        this.save();
        return true;
    }

    remove(id) {
        const idx = this._orders.findIndex(o => o.id === id);
        if (idx === -1) return false;

        this._orders.splice(idx, 1);
        this.save();
        return true;
    }
}

export class UserModel {
    constructor() {
        this.storageKey = 'users';
        this._users = [];
        this.restore();
    }

    restore() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            this._users = JSON.parse(saved);
        } else {
            this._users = [
                { username: 'klim', password: '1111' },
                { username: 'sasha', password: '2222' },
                { username: 'admin', password: 'admin' }
            ];
            this.save();
        }
    }

    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this._users));
    }

    // Проверка логина
    checkCredentials(username, password) {
        return this._users.find(u => u.username === username && u.password === password);
    }
    // Добавление нового пользователя
    addUser(username, password) {
        if (this._users.some(u => u.username === username)) return false;
        this._users.push({ username, password });
        this.save();
        return true;
    }
}
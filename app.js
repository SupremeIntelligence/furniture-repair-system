import { FurnitureRepairModel } from './model.js';
import { FurnitureRepairView } from './view.js';
import { FurnitureRepairController } from './controller.js';

const model = new FurnitureRepairModel();
model.restore();

const view = new FurnitureRepairView();

const controller = new FurnitureRepairController(model, view);
controller.render();

view.setController(controller);

// Глобальные функции для консоли
window.addOrder = function(data) {
    if (!window.currentUser) {
        console.warn('Сначала войдите в систему');
        return;
    }
    data.author = window.currentUser;
    data.createdAt = new Date();
    data.status = data.status || 'Новый';
    
    const added = controller.model.add(data);
    if (added) {
        controller.skip = 0;
        controller.render();
        console.log('Заказ добавлен:', data);
    } else {
        console.warn('Заказ не добавлен. Проверьте данные.');
    }
};

window.editOrder = function(id, updates) {
    const edited = controller.model.edit(id, updates);
    if (edited) {
        controller.render();
        console.log('Заказ обновлён:', id, updates);
    } else {
        console.warn('Не удалось изменить заказ. Проверьте ID или данные.');
    }
};

window.removeOrder = function(id) {
    const removed = controller.model.remove(id);
    if (removed) {
        controller.render();
        console.log('Заказ удалён:', id);
    } else {
        console.warn('Не удалось удалить заказ. Проверьте ID.');
    }
};
import { FurnitureRepairModel } from './model.js';
import { FurnitureRepairView } from './view.js';
import { FurnitureRepairController } from './controller.js';

const model = new FurnitureRepairModel();
model.restore();

const view = new FurnitureRepairView();

const controller = new FurnitureRepairController(model, view);
controller.render();
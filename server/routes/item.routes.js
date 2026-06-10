import express from 'express';
import * as itemController from '../controllers/item.controller.js';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(verifyToken);

// -> item/add
router.post('/add', itemController.addItem);
// -> item/update
router.put('/update/:id', itemController.updateItem);
// -> item/delete
router.delete('/delete/:id', itemController.deleteItem);
// -> item/get/:itemId
router.get('/get/:itemId', itemController.getItemById);
// -> item/getAll
router.get('/getAll', itemController.getAllItems);
// -> item/details/:itemId  (item + active order totals)
router.get('/details/:itemId', itemController.getItemDetails);

export default router;

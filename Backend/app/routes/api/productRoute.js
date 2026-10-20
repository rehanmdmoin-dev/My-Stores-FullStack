const express = require('express');
const ProductController = require('../../controller/api/ProductController');
const Auth = require('../../middleware/auth');
const upload = require('../../utils/uploads');
const router = express.Router();


router.get('/user/get/product', ProductController.getProduct);


router.post('/user/create/product', Auth, upload.single('image'), ProductController.createProduct);
router.put('/user/update/product/:id', Auth, upload.single('image'), ProductController.updateProduct);
router.delete('/user/delete/product/:id', Auth, ProductController.deleteProduct);



module.exports = router;
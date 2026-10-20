const Product = require("../../models/product");
const StatusCode = require("../../utils/StatusCode");
const cloudinary = require('../../config/cloudinary');
const fs = require('fs');

class ProductController {

    async createProduct(req, res) {
        try {
            const { productName, productPrice, desc, brand, stock, size, color } = req.body;

            if (!productName || !productPrice || !desc || !brand) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    status: false,
                    message: "Please provide productName, productPrice, desc, and brand"
                });
            }

            const parsedPrice = Number(productPrice);
            if (Number.isNaN(parsedPrice)) {
                return res.status(StatusCode.BAD_REQUEST).json({
                    status: false,
                    message: "productPrice must be a valid number"
                });
            }

            const parsedSize = typeof size === 'string' ? size.split(',').map(item => item.trim()).filter(Boolean) : Array.isArray(size) ? size : [];
            const parsedColor = typeof color === 'string' ? color.split(',').map(item => item.trim()).filter(Boolean) : Array.isArray(color) ? color : [];

            const product = new Product({
                productName,
                productPrice: parsedPrice,
                desc,
                brand,
                stock: stock ? Number(stock) : 0,
                size: parsedSize,
                color: parsedColor,
                createdBy: req.user.id
            });

            if (req.file) {
                const result = await cloudinary.uploader.upload(req.file.path, { folder: 'products' });
                product.image = result.secure_url;
                product.imagePublicId = result.public_id;
                try { fs.unlinkSync(req.file.path); } catch (e) { }
            }

            const data = await product.save();

            return res.status(StatusCode.CREATED).json({
                status: true,
                message: "Product created successfully",
                data
            });

        } catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                status: false,
                message: "Something went wrong",
                error
            });
        }
    }

    async getProduct(req, res) {
        try {

            const products = await Product.find({
                isdeleted: false
            }).sort({ createdAt: -1 }).lean();

            return res.status(StatusCode.SUCCESS).json({
                status: true,
                total: products.length,
                message: "Product fetched successfully",
                data: products
            });

        } catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                status: false,
                message: "Something went wrong",
                error
            });
        }
    }

    async updateProduct(req, res) {
        try {

            const id = req.params.id;
            const updateData = { ...req.body };

            const existing = await Product.findById(id);
            if (!existing) {
                return res.status(StatusCode.NOT_FOUND).json({
                    status: false,
                    message: "Product not found"
                });
            }
            if (String(existing.createdBy) !== String(req.user.id)) {
                return res.status(StatusCode.FORBIDDEN).json({
                    status: false,
                    message: "You can only update products you created"
                });
            }

            if (updateData.productPrice) {
                updateData.productPrice = Number(updateData.productPrice);
            }

            if (updateData.size) {
                updateData.size = typeof updateData.size === 'string' ?
                    updateData.size.split(',').map(item => item.trim())
                        .filter(Boolean) : Array.isArray(updateData.size) ?
                        updateData.size : [];
            }

            if (updateData.color) {
                updateData.color = typeof updateData.color === 'string' ?
                    updateData.color.split(',').map(item => item.trim())
                        .filter(Boolean) : Array.isArray(updateData.color) ?
                        updateData.color : [];
            }

            if (req.file) {
                if (existing.imagePublicId) {
                    try { await cloudinary.uploader.destroy(existing.imagePublicId); } catch (e) { }
                }
                const result = await cloudinary.uploader.upload(req.file.path, { folder: 'products' });
                updateData.image = result.secure_url;
                updateData.imagePublicId = result.public_id;
                try { fs.unlinkSync(req.file.path); } catch (e) { }
            }

            const product = await Product.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            );

            return res.status(StatusCode.SUCCESS).json({
                status: true,
                message: "Product updated successfully",
                data: product
            });

        } catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                status: false,
                message: "Something went wrong",
                error
            });
        }
    }

    async deleteProduct(req, res) {
        try {

            const id = req.params.id;
            const existing = await Product.findById(id);

            if (!existing) {
                return res.status(StatusCode.NOT_FOUND).json({
                    status: false,
                    message: "Product not found"
                });
            }
            if (String(existing.createdBy) !== String(req.user.id)) {
                return res.status(StatusCode.FORBIDDEN).json({
                    status: false,
                    message: "You can only delete products you created"
                });
            }

            if (existing.imagePublicId) {
                try { await cloudinary.uploader.destroy(existing.imagePublicId); } catch (e) { }
            }

            await Product.findByIdAndDelete(id);

            return res.status(StatusCode.SUCCESS).json({
                status: true,
                message: "Product deleted successfully"
            });

        } catch (error) {
            return res.status(StatusCode.SERVER_ERROR).json({
                status: false,
                message: "Something went wrong",
                error
            });
        }
    }
}

module.exports = new ProductController();
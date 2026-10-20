const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },

    productPrice: {
      type: Number,
      required: true,
    },

    desc: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    imagePublicId: {
      type: String,
      default: "",
    },

    size: [
      {
        type: String,
      },
    ],

    color: [
      {
        type: String,
      },
    ],

    stock: {
      type: Number,
      default: 0,
    },

    brand: {
      type: String,
      required: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    isdeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },

);

module.exports = mongoose.model(
  "Product",
  ProductSchema
);
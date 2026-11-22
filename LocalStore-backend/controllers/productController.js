const mongoose = require('mongoose');
const Product = require('../models/Product');

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const readNumber = (value) => {
  if (value === '' || value === null || value === undefined) return { missing: true };
  const number = Number(value);
  return { missing: false, number };
};

const validateProduct = (body, { partial }) => {
  const update = {};
  const errors = [];

  if (!partial || body.name !== undefined) {
    const name = String(body.name || '').trim();
    if (name.length < 2) errors.push('Name is required');
    else update.name = name;
  }

  if (!partial || body.description !== undefined) {
    const description = String(body.description || '').trim();
    if (!description) errors.push('Description is required');
    else update.description = description;
  }

  if (!partial || body.price !== undefined) {
    const { missing, number } = readNumber(body.price);
    if (missing || !Number.isFinite(number) || number < 0) errors.push('Price must be 0 or more');
    else update.price = number;
  }

  if (!partial || body.stock !== undefined) {
    const { missing, number } = readNumber(body.stock);
    if (missing || !Number.isInteger(number) || number < 0) {
      errors.push('Stock must be a whole number of 0 or more');
    } else {
      update.stock = number;
    }
  }

  if (!partial || body.category !== undefined) {
    if (!mongoose.Types.ObjectId.isValid(body.category)) errors.push('Category is required');
    else update.category = body.category;
  }

  if (body.weight !== undefined) {
    update.weight = String(body.weight || '').trim() || '1 pc';
  }

  if (body.image !== undefined) {
    const image = String(body.image || '').trim();
    if (image.length > 1000) errors.push('Image address is too long');
    else update.image = image;
  }

  return { update, errors };
};

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getAllProducts = async (req, res, next) => {
  try {
    const rawKeyword = String(req.query.keyword || '').trim().slice(0, 80);
    const filter = rawKeyword
      ? { name: { $regex: escapeRegex(rawKeyword), $options: 'i' } }
      : {};

    const products = await Product.find(filter).populate('category', 'name');
    res.json(products);
  } catch (error) {
    next(error);
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(404);
      return next(new Error('Product not found'));
    }

    const product = await Product.findById(req.params.id).populate('category', 'name');

    if (product) {
      res.json(product);
    } else {
      res.status(404);
      next(new Error('Product not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const { update, errors } = validateProduct(req.body, { partial: false });
    if (errors.length) {
      res.status(400);
      return next(new Error(errors[0]));
    }

    const product = await Product.create(update);
    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(404);
      return next(new Error('Product not found'));
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      return next(new Error('Product not found'));
    }

    const { update, errors } = validateProduct(req.body, { partial: true });
    if (errors.length) {
      res.status(400);
      return next(new Error(errors[0]));
    }

    Object.assign(product, update);
    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(404);
      return next(new Error('Product not found'));
    }

    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: product._id });
      res.json({ message: 'Product removed' });
    } else {
      res.status(404);
      next(new Error('Product not found'));
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

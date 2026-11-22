const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { priceOrder } = require('../utils/pricing');

const STATUSES = ['Pending', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'];
const MAX_QTY = 99;

const badRequest = (res, next, message) => {
  res.status(400);
  next(new Error(message));
};

async function releaseStock(items, session) {
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } }, { session });
  }
}

async function reserveStock(items, session) {
  for (const item of items) {
    const updated = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { session }
    );
    if (!updated) {
      const error = new Error(`Not enough stock for ${item.name}`);
      error.statusCode = 400;
      throw error;
    }
  }
}

const addOrderItems = async (req, res, next) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, couponCode } = req.body;

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return badRequest(res, next, 'No order items');
    }

    const address = shippingAddress || {};
    for (const field of ['address', 'city', 'postalCode', 'country']) {
      if (!String(address[field] || '').trim()) {
        return badRequest(res, next, 'Shipping address is incomplete');
      }
    }

    if (paymentMethod && paymentMethod !== 'COD') {
      return badRequest(res, next, 'Only cash on delivery is available');
    }

    const merged = new Map();
    for (const item of orderItems) {
      const id = String(item?.product || '').toLowerCase();
      const quantity = Number(item?.quantity);
      if (!mongoose.Types.ObjectId.isValid(id) || !Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) {
        return badRequest(res, next, 'Each item needs a valid product and a quantity from 1 to 99');
      }
      merged.set(id, (merged.get(id) || 0) + quantity);
      if (merged.get(id) > MAX_QTY) {
        return badRequest(res, next, 'Quantity cannot be more than 99 for one product');
      }
    }

    const ids = [...merged.keys()];
    const products = await Product.find({ _id: { $in: ids } });
    if (products.length !== ids.length) {
      return badRequest(res, next, 'One or more products are no longer available');
    }

    const byId = new Map(products.map((product) => [product._id.toString(), product]));
    const normalizedItems = ids.map((id) => {
      const product = byId.get(id);
      return {
        product: product._id,
        name: product.name,
        quantity: merged.get(id),
        price: product.price,
      };
    });

    const itemsPrice = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const priced = priceOrder({ itemsPrice, couponCode });
    if (priced.error) {
      return badRequest(res, next, priced.error);
    }

    const order = await mongoose.connection.transaction(async (session) => {
      await reserveStock(normalizedItems, session);
      return new Order({
        orderItems: normalizedItems,
        user: req.user._id,
        shippingAddress: {
          address: String(address.address).trim(),
          city: String(address.city).trim(),
          postalCode: String(address.postalCode).trim(),
          country: String(address.country).trim(),
        },
        paymentMethod: 'COD',
        itemsPrice: priced.itemsPrice,
        shippingPrice: priced.shippingPrice,
        discount: priced.discount,
        couponCode: priced.couponCode,
        totalPrice: priced.totalPrice,
      }).save({ session });
    });
    res.status(201).json(order);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(404);
      return next(new Error('Order not found'));
    }

    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      res.status(404);
      return next(new Error('Order not found'));
    }

    const ownerId = order.user?._id ? order.user._id.toString() : String(order.user);
    const isOwner = ownerId === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      res.status(403);
      return next(new Error('Not authorized to view this order'));
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) {
      return badRequest(res, next, 'Invalid order status');
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      res.status(404);
      return next(new Error('Order not found'));
    }

    const order = await mongoose.connection.transaction(async (session) => {
      const current = await Order.findById(req.params.id).session(session);
      if (!current || current.status === status) return current;

      if (status === 'Cancelled') {
        await releaseStock(current.orderItems, session);
      } else if (current.status === 'Cancelled') {
        await reserveStock(current.orderItems, session);
      }

      current.status = status;
      return current.save({ session });
    });
    if (!order) {
      res.status(404);
      return next(new Error('Order not found'));
    }

    res.json(order);
  } catch (error) {
    if (error.statusCode) res.status(error.statusCode);
    next(error);
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
};

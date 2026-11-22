const test = require('node:test');
const assert = require('node:assert/strict');
const { priceOrder, shippingFor } = require('./pricing');

test('charges delivery at ₹100 and waives it above that', () => {
  assert.equal(shippingFor(100), 10);
  assert.equal(shippingFor(100.01), 0);
  assert.equal(priceOrder({ itemsPrice: 80 }).totalPrice, 90);
  assert.equal(priceOrder({ itemsPrice: 150 }).totalPrice, 150);
});

test('applies known coupons only when the threshold is met', () => {
  assert.equal(priceOrder({ itemsPrice: 100, couponCode: 'save20' }).totalPrice, 90);
  assert.equal(priceOrder({ itemsPrice: 99, couponCode: 'SAVE20' }).error !== undefined, true);
  assert.equal(priceOrder({ itemsPrice: 200, couponCode: 'SAVE50' }).discount, 50);
  assert.equal(priceOrder({ itemsPrice: 1000, couponCode: 'SAVE200' }).totalPrice, 800);
  assert.equal(priceOrder({ itemsPrice: 500, couponCode: 'FREE' }).error !== undefined, true);
});

test('ignores a blank coupon', () => {
  const priced = priceOrder({ itemsPrice: 40, couponCode: '   ' });
  assert.equal(priced.couponCode, '');
  assert.equal(priced.discount, 0);
  assert.equal(priced.totalPrice, 50);
});

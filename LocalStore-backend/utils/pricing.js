const COUPONS = {
  SAVE20: { min: 100, off: 20 },
  SAVE50: { min: 200, off: 50 },
  SAVE200: { min: 1000, off: 200 },
};

// Free delivery above ₹100. Keep this rule in sync with Checkout.js.
function shippingFor(itemsPrice) {
  return itemsPrice > 100 ? 0 : 10;
}

function priceOrder({ itemsPrice, couponCode }) {
  const code = String(couponCode || '').trim().toUpperCase();
  let discount = 0;

  if (code) {
    const coupon = COUPONS[code];
    if (!Object.hasOwn(COUPONS, code) || itemsPrice < coupon.min) {
      return { error: 'Coupon is invalid or the order total is too low' };
    }
    discount = coupon.off;
  }

  const shippingPrice = shippingFor(itemsPrice);
  const totalPrice = Math.max(0, Number((itemsPrice + shippingPrice - discount).toFixed(2)));

  return {
    couponCode: code,
    discount,
    shippingPrice,
    itemsPrice: Number(itemsPrice.toFixed(2)),
    totalPrice,
  };
}

module.exports = { COUPONS, shippingFor, priceOrder };

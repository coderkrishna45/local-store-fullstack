exports.seed = async function(knex) {
  // Clear out old data
  await knex('inventory').del();
  await knex('products').del();

  // 1. Insert Products and get their IDs back
  const products = await knex('products').insert([
    { name: 'Amul Gold Milk', description: '1L Full Cream Pack', price: 66.00 },
    { name: 'Harvest Gold Bread', description: 'White Sandwich Bread', price: 40.00 },
    { name: 'Lays Classic', description: 'Blue Pack - Family Size', price: 20.00 }
  ]).returning(['id', 'name']);

  // 2. Insert Inventory for those products
  const inventoryData = products.map(p => ({
    product_id: p.id,
    quantity: 100, // 100 units of each
    version: 1
  }));

  return knex('inventory').insert(inventoryData);
};
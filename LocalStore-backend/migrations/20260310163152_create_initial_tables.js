exports.up = function(knex) {
  return knex.schema
    .createTable('users', (table) => {
      table.increments('id').primary();
      table.string('username').unique().notNullable();
      table.string('email').unique().notNullable();
      table.string('password_hash').notNullable();
      table.string('role').defaultTo('customer');
      table.timestamps(true, true);
    })
    .createTable('products', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.text('description');
      table.decimal('price', 10, 2).notNullable();
    })
    .createTable('inventory', (table) => {
      table.integer('product_id').unsigned().primary()
           .references('id').inTable('products').onDelete('CASCADE');
      table.integer('quantity').defaultTo(0);
      table.integer('version').defaultTo(1); // For Optimistic Locking //Intuition: When User A and User B both try to buy the last milk, the backend checks the version. If User A finishes first, they update the version to 2. When User B's request arrives, the system sees the version is no longer 1 and says, "Sorry, the stock changed while you were checking out!" This prevents "over-selling."
    });
};

exports.down = function(knex) {
  return knex.schema.dropTable('inventory').dropTable('products').dropTable('users');
};
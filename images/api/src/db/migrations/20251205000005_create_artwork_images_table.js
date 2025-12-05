exports.up = function(knex) {
  return knex.schema
    // Create artwork_images table
    .createTable('artwork_images', function(t) {
      t.increments('id').primary();
      t.uuid('uuid').notNullable().unique();
      t.integer('artwork_id').unsigned().notNullable();
      t.string('filename', 255).notNullable();
      t.string('original_filename', 255).notNullable();
      t.string('mime_type', 100).notNullable();
      t.integer('file_size').unsigned().notNullable();
      t.text('description');
      t.integer('sort_order').unsigned().defaultTo(0);
      t.timestamps(true, true);

      // Foreign key
      t.foreign('artwork_id').references('id').inTable('artworks').onDelete('CASCADE');

      // Index for faster queries
      t.index(['artwork_id', 'sort_order']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('artwork_images');
};
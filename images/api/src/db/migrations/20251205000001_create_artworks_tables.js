
exports.up = function(knex) {
  return knex.schema
    // Create mediums table first (no dependencies)
    .createTable('mediums', function(t) {
      t.increments('id').primary();
      t.uuid('uuid').notNullable().unique();
      t.string('name', 100).notNullable();
      t.timestamps(true, true);
    })
    // Create artworks table
    .createTable('artworks', function(t) {
      t.increments('id').primary();
      t.uuid('uuid').notNullable().unique();
      t.string('title', 255).notNullable();
      t.text('description');
      t.string('size', 100);
      t.timestamps(true, true);
    })
    // Create artworks_artists junction table
    .createTable('artworks_artists', function(t) {
      t.increments('id').primary();
      t.uuid('uuid').notNullable().unique();
      t.integer('artist_id').unsigned().notNullable();
      t.integer('artwork_id').unsigned().notNullable();
      t.timestamps(true, true);

      // Foreign keys
      t.foreign('artist_id').references('id').inTable('users').onDelete('CASCADE');
      t.foreign('artwork_id').references('id').inTable('artworks').onDelete('CASCADE');

      // Ensure unique artist-artwork combinations
      t.unique(['artist_id', 'artwork_id']);
    })
    // Create artworks_mediums junction table
    .createTable('artworks_mediums', function(t) {
      t.increments('id').primary();
      t.uuid('uuid').notNullable().unique();
      t.integer('artwork_id').unsigned().notNullable();
      t.integer('medium_id').unsigned().notNullable();
      t.timestamps(true, true);

      // Foreign keys
      t.foreign('artwork_id').references('id').inTable('artworks').onDelete('CASCADE');
      t.foreign('medium_id').references('id').inTable('mediums').onDelete('CASCADE');

      // Ensure unique artwork-medium combinations
      t.unique(['artwork_id', 'medium_id']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('artworks_mediums')
    .dropTableIfExists('artworks_artists')
    .dropTableIfExists('artworks')
    .dropTableIfExists('mediums');
};

/**
 * Migration: Create rentals table
 * Purpose: Track artwork rental requests and their status
 */

exports.up = function(knex) {
  return knex.schema.createTable('rentals', function(table) {
    table.increments('id').primary();
    table.uuid('uuid').notNullable().unique();

    // Foreign keys
    table.integer('artwork_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();

    // Rental details
    table.string('address', 500).notNullable();
    table.string('phone_number', 50).notNullable();
    table.date('start_date').notNullable();
    table.date('end_date').notNullable();

    // Status: 'requested', 'approved', 'finalized', 'rejected'
    table.enum('status', ['requested', 'approved', 'finalized', 'rejected']).defaultTo('requested');

    // Admin actions
    table.integer('approved_by').unsigned().nullable(); // admin user id who approved
    table.timestamp('approved_at').nullable();
    table.integer('finalized_by').unsigned().nullable(); // admin user id who finalized
    table.timestamp('finalized_at').nullable();

    table.timestamps(true, true);

    // Foreign key constraints
    table.foreign('artwork_id').references('artworks.id').onDelete('CASCADE');
    table.foreign('user_id').references('users.id').onDelete('CASCADE');
    table.foreign('approved_by').references('users.id').onDelete('SET NULL');
    table.foreign('finalized_by').references('users.id').onDelete('SET NULL');

    // Indexes
    table.index('artwork_id');
    table.index('user_id');
    table.index('status');
    table.index(['start_date', 'end_date']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('rentals');
};

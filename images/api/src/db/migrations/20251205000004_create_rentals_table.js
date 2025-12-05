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
    table.date('rental_date').notNullable(); // Date when rental starts
    table.date('expected_return_date').notNullable(); // Auto-calculated: rental_date + 1 month

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
    table.index('rental_date');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('rentals');
};

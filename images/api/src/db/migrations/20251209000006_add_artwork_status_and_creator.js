/**
 * Migration: Add status and creator tracking to artworks table
 * Adds fields for artwork submission workflow and admin approval
 */

exports.up = function(knex) {
  return knex.schema.table('artworks', function(table) {
    // Add status field: 'approved', 'pending', 'declined'
    table.string('status', 20).notNullable().defaultTo('approved');

    // Add created_by_user_id to track who submitted/created the artwork
    table.integer('created_by_user_id').unsigned().nullable();
    table.foreign('created_by_user_id')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');

    // Add approval tracking fields
    table.integer('reviewed_by_user_id').unsigned().nullable();
    table.foreign('reviewed_by_user_id')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');

    table.timestamp('reviewed_at').nullable();
    table.text('review_notes').nullable();

    // Add indexes for efficient filtering
    table.index('status');
    table.index('created_by_user_id');
  });
};

exports.down = function(knex) {
  return knex.schema.table('artworks', function(table) {
    // Drop foreign keys first
    table.dropForeign('created_by_user_id');
    table.dropForeign('reviewed_by_user_id');

    // Drop columns
    table.dropColumn('status');
    table.dropColumn('created_by_user_id');
    table.dropColumn('reviewed_by_user_id');
    table.dropColumn('reviewed_at');
    table.dropColumn('review_notes');
  });
};

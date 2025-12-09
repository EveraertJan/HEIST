/**
 * Stub migration file to satisfy knex migration tracker
 * This migration was created and run elsewhere, then the file was removed
 */

exports.up = function(knex) {
  // No-op: migration already applied
  return Promise.resolve();
};

exports.down = function(knex) {
  // No-op: rollback not supported for this stub
  return Promise.resolve();
};

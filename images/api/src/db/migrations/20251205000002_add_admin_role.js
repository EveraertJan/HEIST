
exports.up = function(knex) {
  return knex.schema.table('users', function(t) {
    t.boolean('is_admin').defaultTo(false);
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', function(t) {
    t.dropColumn('is_admin');
  });
};

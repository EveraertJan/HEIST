
exports.up = function(knex) {
  return knex.schema.table('artworks', function(t) {
    // Add new dimension fields
    t.string('width', 50);
    t.string('height', 50);
    t.string('depth', 50);
  }).then(() => {
    // Migrate existing size data if needed
    // Since size was a free-form string, we'll just keep it for now
    // Admin can re-enter dimensions for existing artworks
  });
};

exports.down = function(knex) {
  return knex.schema.table('artworks', function(t) {
    t.dropColumn('width');
    t.dropColumn('height');
    t.dropColumn('depth');
  });
};

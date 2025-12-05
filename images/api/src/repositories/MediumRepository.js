/**
 * MediumRepository - Data access layer for medium-related database operations
 * Implements the Repository pattern to abstract database operations
 * @class
 */
class MediumRepository {
  /**
   * Creates an instance of MediumRepository
   * @param {Object} db - Database connection instance (Knex)
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Find all mediums
   * @returns {Promise<Array>} Array of medium objects
   */
  async findAll() {
    return await this.db('mediums')
      .select('*')
      .orderBy('name', 'asc');
  }

  /**
   * Find a medium by UUID
   * @param {string} uuid - Medium's unique identifier
   * @returns {Promise<Object|null>} Medium object or null if not found
   */
  async findByUuid(uuid) {
    return await this.db('mediums')
      .where({ uuid })
      .first();
  }

  /**
   * Find a medium by name
   * @param {string} name - Medium's name
   * @returns {Promise<Object|null>} Medium object or null if not found
   */
  async findByName(name) {
    return await this.db('mediums')
      .where({ name })
      .first();
  }

  /**
   * Create a new medium
   * @param {Object} mediumData - Medium data object
   * @param {string} mediumData.uuid - Medium's UUID
   * @param {string} mediumData.name - Medium name
   * @returns {Promise<Object>} Created medium object
   */
  async create(mediumData) {
    const [medium] = await this.db('mediums')
      .insert(mediumData)
      .returning('*');

    return medium;
  }

  /**
   * Update a medium
   * @param {string} uuid - Medium's UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated medium object or null
   */
  async update(uuid, updates) {
    const [medium] = await this.db('mediums')
      .where({ uuid })
      .update({
        ...updates,
        updated_at: this.db.fn.now()
      })
      .returning('*');

    return medium || null;
  }

  /**
   * Delete a medium
   * @param {string} uuid - Medium's UUID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  async delete(uuid) {
    const deleted = await this.db('mediums')
      .where({ uuid })
      .del();

    return deleted > 0;
  }
}

module.exports = MediumRepository;

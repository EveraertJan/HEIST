/**
 * ArtworkRepository - Data access layer for artwork-related database operations
 * Implements the Repository pattern to abstract database operations
 * @class
 */
class ArtworkRepository {
  /**
   * Creates an instance of ArtworkRepository
   * @param {Object} db - Database connection instance (Knex)
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Find all artworks with pagination
   * @param {number} limit - Maximum number of results
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Array>} Array of artwork objects
   */
  async findAll(limit = 50, offset = 0) {
    return await this.db('artworks')
      .select('*')
      .limit(limit)
      .offset(offset)
      .orderBy('created_at', 'desc');
  }

  /**
   * Find an artwork by UUID with related data (artists and mediums)
   * @param {string} uuid - Artwork's unique identifier
   * @returns {Promise<Object|null>} Artwork object with artists and mediums or null
   */
  async findByUuid(uuid) {
    const artwork = await this.db('artworks')
      .where({ uuid })
      .first();

    if (!artwork) {
      return null;
    }

    // Get associated artists
    const artists = await this.db('artworks_artists as aa')
      .join('users as u', 'aa.artist_id', 'u.id')
      .where('aa.artwork_id', artwork.id)
      .select('u.uuid', 'u.first_name', 'u.last_name', 'u.email');

    // Get associated mediums
    const mediums = await this.db('artworks_mediums as am')
      .join('mediums as m', 'am.medium_id', 'm.id')
      .where('am.artwork_id', artwork.id)
      .select('m.uuid', 'm.name');

    return {
      ...artwork,
      artists,
      mediums
    };
  }

  /**
   * Search artworks by title, artist name, or filter by mediums
   * @param {Object} filters - Search filters
   * @param {string} [filters.search] - Search term for title or artist name
   * @param {Array<string>} [filters.mediums] - Array of medium UUIDs to filter by
   * @param {number} [filters.limit=50] - Maximum number of results
   * @param {number} [filters.offset=0] - Offset for pagination
   * @returns {Promise<Array>} Array of artwork objects
   */
  async search(filters = {}) {
    const { search, mediums, limit = 50, offset = 0 } = filters;

    let query = this.db('artworks as a')
      .distinct('a.*')
      .leftJoin('artworks_artists as aa', 'a.id', 'aa.artwork_id')
      .leftJoin('users as u', 'aa.artist_id', 'u.id')
      .leftJoin('artworks_mediums as am', 'a.id', 'am.artwork_id')
      .leftJoin('mediums as m', 'am.medium_id', 'm.id')

    // Search by title or artist name
    if (search) {
      query = query.where(function() {
        this.where('a.title', 'ilike', `%${search}%`)
          .orWhere('u.first_name', 'ilike', `%${search}%`)
          .orWhere('u.last_name', 'ilike', `%${search}%`);
      });
    }

    // Filter by mediums
    if (mediums && mediums.length > 0) {
      query = query.whereIn('m.uuid', mediums);
    }

    const artworks = await query
      .limit(limit)
      .offset(offset)
      .orderBy('a.created_at', 'desc')

    return artworks;
  }

  /**
   * Create a new artwork
   * @param {Object} artworkData - Artwork data object
   * @param {string} artworkData.uuid - Artwork's UUID
   * @param {string} artworkData.title - Artwork title
   * @param {string} [artworkData.description] - Artwork description
   * @param {string} [artworkData.size] - Artwork size
   * @returns {Promise<Object>} Created artwork object
   */
  async create(artworkData) {
    const [artwork] = await this.db('artworks')
      .insert(artworkData)
      .returning('*');

    return artwork;
  }

  /**
   * Update an artwork
   * @param {string} uuid - Artwork's UUID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object|null>} Updated artwork object or null
   */
  async update(uuid, updates) {
    const [artwork] = await this.db('artworks')
      .where({ uuid })
      .update({
        ...updates,
        updated_at: this.db.fn.now()
      })
      .returning('*');

    return artwork || null;
  }

  /**
   * Delete an artwork
   * @param {string} uuid - Artwork's UUID
   * @returns {Promise<boolean>} True if deleted, false otherwise
   */
  async delete(uuid) {
    const deleted = await this.db('artworks')
      .where({ uuid })
      .del();

    return deleted > 0;
  }

  /**
   * Add an artist to an artwork
   * @param {Object} data - Link data
   * @param {string} data.uuid - Link UUID
   * @param {number} data.artwork_id - Artwork ID
   * @param {number} data.artist_id - Artist (user) ID
   * @returns {Promise<Object>} Created link object
   */
  async addArtist(data) {
    const [link] = await this.db('artworks_artists')
      .insert(data)
      .returning('*');

    return link;
  }

  /**
   * Add a medium to an artwork
   * @param {Object} data - Link data
   * @param {string} data.uuid - Link UUID
   * @param {number} data.artwork_id - Artwork ID
   * @param {number} data.medium_id - Medium ID
   * @returns {Promise<Object>} Created link object
   */
  async addMedium(data) {
    const [link] = await this.db('artworks_mediums')
      .insert(data)
      .returning('*');

    return link;
  }

  /**
   * Remove an artist from an artwork
   * @param {number} artworkId - Artwork ID
   * @param {number} artistId - Artist ID
   * @returns {Promise<boolean>} True if removed
   */
  async removeArtist(artworkId, artistId) {
    const deleted = await this.db('artworks_artists')
      .where({ artwork_id: artworkId, artist_id: artistId })
      .del();

    return deleted > 0;
  }

  /**
   * Remove a medium from an artwork
   * @param {number} artworkId - Artwork ID
   * @param {number} mediumId - Medium ID
   * @returns {Promise<boolean>} True if removed
   */
  async removeMedium(artworkId, mediumId) {
    const deleted = await this.db('artworks_mediums')
      .where({ artwork_id: artworkId, medium_id: mediumId })
      .del();

    return deleted > 0;
  }
}

module.exports = ArtworkRepository;

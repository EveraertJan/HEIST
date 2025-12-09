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
   * Find all artworks with pagination and status filtering
   * @param {number} limit - Maximum number of results
   * @param {number} offset - Offset for pagination
   * @param {Object} filters - Filtering options
   * @param {boolean} [filters.includeAll=false] - Include all statuses (admin only)
   * @param {string} [filters.status='approved'] - Status to filter by
   * @param {number} [filters.userId=null] - User ID to include their own artworks
   * @returns {Promise<Array>} Array of artwork objects
   */
  async findAll(limit = 50, offset = 0, filters = {}) {
    const { includeAll = false, status = 'approved', userId = null } = filters;

    let query = this.db('artworks as a')
      .select('a.*', 'r.status as rental_status')
      .limit(limit)
      .offset(offset)
      .leftJoin('rentals as r', 'r.artwork_id', 'a.id');

    if (userId) {
      // If userId is provided, filter to only that user's artworks
      query = query.where('a.created_by_user_id', userId);
      // If not includeAll, also filter by status
      if (!includeAll) {
        query = query.where('a.status', status);
      }
    } else if (!includeAll) {
      // No userId provided, filter by status only
      query = query.where('a.status', status);
    }
    // If includeAll and no userId, show all artworks (admin viewing all)

    const artworks = await query.orderBy('a.created_at', 'desc');

    // Get related data for each artwork
    for (const artwork of artworks) {
      // Get images
      const images = await this.db('artwork_images')
        .where('artwork_id', artwork.id)
        .select('*')
        .orderBy('sort_order', 'asc');
      artwork.images = images;

      // Get associated artists
      const artists = await this.db('artworks_artists as aa')
        .join('users as u', 'aa.artist_id', 'u.id')
        .where('aa.artwork_id', artwork.id)
        .select('u.uuid', 'u.first_name', 'u.last_name', 'u.email');
      artwork.artists = artists;

      // Get associated mediums
      const mediums = await this.db('artworks_mediums as am')
        .join('mediums as m', 'am.medium_id', 'm.id')
        .where('am.artwork_id', artwork.id)
        .select('m.uuid', 'm.name');
      artwork.mediums = mediums;
    }

    return artworks;
  }

  /**
   * Find an artwork by UUID with related data (artists, mediums, creator, reviewer)
   * @param {string} uuid - Artwork's unique identifier
   * @returns {Promise<Object|null>} Artwork object with all related data or null
   */
  async findByUuid(uuid) {
    const artwork = await this.db('artworks')
      .where({ uuid })
      .first();

    if (!artwork) {
      return null;
    }

    // Get creator info
    if (artwork.created_by_user_id) {
      const creator = await this.db('users')
        .where('id', artwork.created_by_user_id)
        .select('uuid', 'first_name', 'last_name', 'email')
        .first();
      artwork.creator = creator;
    }

    // Get reviewer info
    if (artwork.reviewed_by_user_id) {
      const reviewer = await this.db('users')
        .where('id', artwork.reviewed_by_user_id)
        .select('uuid', 'first_name', 'last_name', 'email')
        .first();
      artwork.reviewer = reviewer;
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

    // Get associated images
    const images = await this.db('artwork_images')
      .where('artwork_id', artwork.id)
      .select('*')
      .orderBy('sort_order', 'asc');

    return {
      ...artwork,
      creator: artwork.creator || null,
      reviewer: artwork.reviewer || null,
      artists,
      mediums,
      images
    };
  }

  /**
   * Search artworks by title, artist name, or filter by mediums
   * @param {Object} filters - Search filters
   * @param {string} [filters.search] - Search term for title or artist name
   * @param {Array<string>} [filters.mediums] - Array of medium UUIDs to filter by
   * @param {number} [filters.limit=50] - Maximum number of results
   * @param {number} [filters.offset=0] - Offset for pagination
   * @param {boolean} [filters.includeAll=false] - Include all statuses (admin only)
   * @param {string} [filters.status='approved'] - Status to filter by
   * @param {number} [filters.userId=null] - User ID to include their own artworks
   * @returns {Promise<Array>} Array of artwork objects
   */
  async search(filters = {}) {
    const { search, mediums, limit = 50, offset = 0, includeAll = false, status = 'approved', userId = null } = filters;

    let query = this.db('artworks as a')
      .distinct('a.*')
      .leftJoin('artworks_artists as aa', 'a.id', 'aa.artwork_id')
      .leftJoin('users as u', 'aa.artist_id', 'u.id')
      .leftJoin('artworks_mediums as am', 'a.id', 'am.artwork_id')
      .leftJoin('mediums as m', 'am.medium_id', 'm.id')

    // Filter by status, but if userId is provided, also show artworks created by that user
    if (!includeAll) {
      if (userId) {
        query = query.where(function() {
          this.where('a.status', status)
            .orWhere('a.created_by_user_id', userId);
        });
      } else {
        query = query.where('a.status', status);
      }
    }

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

    // Get related data for each artwork
    for (const artwork of artworks) {
      // Get images
      const images = await this.db('artwork_images')
        .where('artwork_id', artwork.id)
        .select('*')
        .orderBy('sort_order', 'asc');
      artwork.images = images;

      // Get associated artists
      const artists = await this.db('artworks_artists as aa')
        .join('users as u', 'aa.artist_id', 'u.id')
        .where('aa.artwork_id', artwork.id)
        .select('u.uuid', 'u.first_name', 'u.last_name', 'u.email');
      artwork.artists = artists;

      // Get associated mediums
      const mediums = await this.db('artworks_mediums as am')
        .join('mediums as m', 'am.medium_id', 'm.id')
        .where('am.artwork_id', artwork.id)
        .select('m.uuid', 'm.name');
      artwork.mediums = mediums;
    }

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

  /**
   * Find artwork by ID
   * @param {number} artworkId - Artwork ID
   * @returns {Promise<Object|null>} Artwork object or null
   */
  async findById(artworkId) {
    return await this.db('artworks')
      .where({ id: artworkId })
      .first();
  }

  /**
   * Update artwork status (approve/decline)
   * @param {string} uuid - Artwork UUID
   * @param {Object} statusData - Status update data
   * @param {string} statusData.status - New status ('approved', 'pending', 'declined')
   * @param {number} statusData.reviewed_by_user_id - Reviewer user ID
   * @param {string} [statusData.review_notes] - Optional review notes
   * @returns {Promise<Object|null>} Updated artwork or null
   */
  async updateStatus(uuid, statusData) {
    const { status, reviewed_by_user_id, review_notes } = statusData;

    const [artwork] = await this.db('artworks')
      .where({ uuid })
      .update({
        status,
        reviewed_by_user_id,
        reviewed_at: this.db.fn.now(),
        review_notes,
        updated_at: this.db.fn.now()
      })
      .returning('*');

    return artwork || null;
  }

  /**
   * Check if artwork was created by a specific user
   * @param {string} uuid - Artwork UUID
   * @param {number} userId - User ID
   * @returns {Promise<boolean>} True if user created the artwork
   */
  async isCreatedBy(uuid, userId) {
    const artwork = await this.db('artworks')
      .where({ uuid, created_by_user_id: userId })
      .first();

    return !!artwork;
  }
}

module.exports = ArtworkRepository;

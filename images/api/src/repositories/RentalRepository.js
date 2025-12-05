/**
 * RentalRepository - Data access layer for rental operations
 */
class RentalRepository {
  constructor(db) {
    this.db = db;
  }

  /**
   * Find all rentals with pagination
   */
  async findAll(limit = 50, offset = 0) {
    return await this.db('rentals')
      .select(
        'rentals.*',
        'artworks.title as artwork_title',
        'artworks.uuid as artwork_uuid',
        'users.first_name as user_first_name',
        'users.last_name as user_last_name',
        'users.email as user_email'
      )
      .leftJoin('artworks', 'rentals.artwork_id', 'artworks.id')
      .leftJoin('users', 'rentals.user_id', 'users.id')
      .orderBy('rentals.created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  /**
   * Find rental by UUID with full details
   */
  async findByUuid(uuid) {
    const rental = await this.db('rentals')
      .select('rentals.*')
      .where('rentals.uuid', uuid)
      .first();

    if (!rental) return null;

    // Get artwork details
    const artwork = await this.db('artworks')
      .select('uuid', 'title', 'description')
      .where('id', rental.artwork_id)
      .first();

    // Get user details
    const user = await this.db('users')
      .select('uuid', 'first_name', 'last_name', 'email')
      .where('id', rental.user_id)
      .first();

    return {
      ...rental,
      artwork,
      user
    };
  }

  /**
   * Find rentals by user ID
   */
  async findByUserId(userId, limit = 50, offset = 0) {
    return await this.db('rentals')
      .select(
        'rentals.*',
        'artworks.title as artwork_title',
        'artworks.uuid as artwork_uuid'
      )
      .leftJoin('artworks', 'rentals.artwork_id', 'artworks.id')
      .where('rentals.user_id', userId)
      .orderBy('rentals.created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  /**
   * Find rentals by artwork ID
   */
  async findByArtworkId(artworkId) {
    return await this.db('rentals')
      .select('*')
      .where('artwork_id', artworkId)
      .orderBy('created_at', 'desc');
  }

  /**
   * Check if artwork is available for rental in given timespan
   * Returns true if available, false if already rented
   */
  async isArtworkAvailable(artworkId, startDate, endDate, excludeRentalId = null) {
    let query = this.db('rentals')
      .where('artwork_id', artworkId)
      .whereIn('status', ['requested', 'approved']) // Only active rentals block availability
      .where(function() {
        this.where(function() {
          // Rental starts during requested period
          this.whereBetween('start_date', [startDate, endDate]);
        })
        .orWhere(function() {
          // Rental ends during requested period
          this.whereBetween('end_date', [startDate, endDate]);
        })
        .orWhere(function() {
          // Rental encompasses requested period
          this.where('start_date', '<=', startDate)
              .where('end_date', '>=', endDate);
        });
      });

    // Exclude current rental when updating
    if (excludeRentalId) {
      query = query.whereNot('id', excludeRentalId);
    }

    const conflictingRentals = await query;
    return conflictingRentals.length === 0;
  }

  /**
   * Create new rental
   */
  async create(rentalData) {
    const [rental] = await this.db('rentals')
      .insert(rentalData)
      .returning('*');
    return rental;
  }

  /**
   * Update rental
   */
  async update(uuid, updates) {
    const [rental] = await this.db('rentals')
      .where('uuid', uuid)
      .update({
        ...updates,
        updated_at: this.db.fn.now()
      })
      .returning('*');
    return rental;
  }

  /**
   * Delete rental
   */
  async delete(uuid) {
    return await this.db('rentals')
      .where('uuid', uuid)
      .del();
  }

  /**
   * Get all pending rental requests (for admin)
   */
  async findPendingRequests() {
    return await this.db('rentals')
      .select(
        'rentals.*',
        'artworks.title as artwork_title',
        'artworks.uuid as artwork_uuid',
        'users.first_name as user_first_name',
        'users.last_name as user_last_name',
        'users.email as user_email'
      )
      .leftJoin('artworks', 'rentals.artwork_id', 'artworks.id')
      .leftJoin('users', 'rentals.user_id', 'users.id')
      .where('rentals.status', 'requested')
      .orderBy('rentals.created_at', 'asc');
  }
}

module.exports = RentalRepository;

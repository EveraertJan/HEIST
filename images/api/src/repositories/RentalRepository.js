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
   * Find rental by user ID
   */
  async findById(rentalId) {
    return await this.db('rentals')
      .select('*')
      .where('id', rentalId)
      .first();
  }

  /**
   * Check if artwork is available for rental
   * An artwork is unavailable if it has any active rental (requested or approved status)
   * Returns true if available, false if already rented
   */
  async isArtworkAvailable(artworkId) {
    const activeRentals = await this.db('rentals')
      .where('artwork_id', artworkId)
      .whereIn('status', ['requested', 'approved'])
      .limit(1);

    return activeRentals.length === 0;
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

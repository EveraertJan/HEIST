const { v4: uuidv4 } = require('uuid');

/**
 * RentalService - Business logic for rental operations
 */
class RentalService {
  constructor(rentalRepository, artworkRepository, userRepository) {
    this.rentalRepository = rentalRepository;
    this.artworkRepository = artworkRepository;
    this.userRepository = userRepository;
  }

  /**
   * Create a rental request
   */
  async createRentalRequest(requestData) {
    const { artworkUuid, userId, address, phoneNumber, startDate, endDate } = requestData;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    if (start < now) {
      const error = new Error('Start date cannot be in the past');
      error.statusCode = 400;
      throw error;
    }

    if (end <= start) {
      const error = new Error('End date must be after start date');
      error.statusCode = 400;
      throw error;
    }

    // Find artwork
    const artwork = await this.artworkRepository.findByUuid(artworkUuid);
    if (!artwork) {
      const error = new Error('Artwork not found');
      error.statusCode = 404;
      throw error;
    }

    // Check availability
    const isAvailable = await this.rentalRepository.isArtworkAvailable(
      artwork.id,
      startDate,
      endDate
    );

    if (!isAvailable) {
      const error = new Error('Artwork is not available for the selected dates');
      error.statusCode = 409;
      throw error;
    }

    // Create rental request
    const rental = await this.rentalRepository.create({
      uuid: uuidv4(),
      artwork_id: artwork.id,
      user_id: userId,
      address,
      phone_number: phoneNumber,
      start_date: startDate,
      end_date: endDate,
      status: 'requested'
    });

    return await this.rentalRepository.findByUuid(rental.uuid);
  }

  /**
   * Get all rentals (admin)
   */
  async getAllRentals(limit = 50, offset = 0) {
    return await this.rentalRepository.findAll(limit, offset);
  }

  /**
   * Get rental by UUID
   */
  async getRentalByUuid(uuid) {
    const rental = await this.rentalRepository.findByUuid(uuid);
    if (!rental) {
      const error = new Error('Rental not found');
      error.statusCode = 404;
      throw error;
    }
    return rental;
  }

  /**
   * Get user's rentals
   */
  async getUserRentals(userId, limit = 50, offset = 0) {
    return await this.rentalRepository.findByUserId(userId, limit, offset);
  }

  /**
   * Get pending rental requests (admin)
   */
  async getPendingRequests() {
    return await this.rentalRepository.findPendingRequests();
  }

  /**
   * Approve rental request (admin)
   */
  async approveRental(uuid, adminUserId) {
    const rental = await this.rentalRepository.findByUuid(uuid);

    if (!rental) {
      const error = new Error('Rental not found');
      error.statusCode = 404;
      throw error;
    }

    if (rental.status !== 'requested') {
      const error = new Error('Only requested rentals can be approved');
      error.statusCode = 400;
      throw error;
    }

    // Check if still available
    const isAvailable = await this.rentalRepository.isArtworkAvailable(
      rental.artwork_id,
      rental.start_date,
      rental.end_date,
      rental.id
    );

    if (!isAvailable) {
      const error = new Error('Artwork is no longer available for the selected dates');
      error.statusCode = 409;
      throw error;
    }

    const updated = await this.rentalRepository.update(uuid, {
      status: 'approved',
      approved_by: adminUserId,
      approved_at: new Date()
    });

    return await this.rentalRepository.findByUuid(uuid);
  }

  /**
   * Reject rental request (admin)
   */
  async rejectRental(uuid, adminUserId) {
    const rental = await this.rentalRepository.findByUuid(uuid);

    if (!rental) {
      const error = new Error('Rental not found');
      error.statusCode = 404;
      throw error;
    }

    if (rental.status !== 'requested') {
      const error = new Error('Only requested rentals can be rejected');
      error.statusCode = 400;
      throw error;
    }

    await this.rentalRepository.update(uuid, {
      status: 'rejected'
    });

    return await this.rentalRepository.findByUuid(uuid);
  }

  /**
   * Finalize rental (admin - artwork returned)
   */
  async finalizeRental(uuid, adminUserId) {
    const rental = await this.rentalRepository.findByUuid(uuid);

    if (!rental) {
      const error = new Error('Rental not found');
      error.statusCode = 404;
      throw error;
    }

    if (rental.status !== 'approved') {
      const error = new Error('Only approved rentals can be finalized');
      error.statusCode = 400;
      throw error;
    }

    await this.rentalRepository.update(uuid, {
      status: 'finalized',
      finalized_by: adminUserId,
      finalized_at: new Date()
    });

    return await this.rentalRepository.findByUuid(uuid);
  }

  /**
   * Check if artwork is available for rental
   */
  async checkArtworkAvailability(artworkUuid, startDate, endDate) {
    const artwork = await this.artworkRepository.findByUuid(artworkUuid);
    if (!artwork) {
      const error = new Error('Artwork not found');
      error.statusCode = 404;
      throw error;
    }

    const isAvailable = await this.rentalRepository.isArtworkAvailable(
      artwork.id,
      startDate,
      endDate
    );

    return { available: isAvailable };
  }
}

module.exports = RentalService;

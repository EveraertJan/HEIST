const { v4: uuidv4 } = require('uuid');

/**
 * RentalService - Business logic for rental operations
 */
class RentalService {
  constructor(rentalRepository, artworkRepository, userRepository, emailService) {
    this.rentalRepository = rentalRepository;
    this.artworkRepository = artworkRepository;
    this.userRepository = userRepository;
    this.emailService = emailService;
  }

  /**
   * Create a rental request
   */
  async createRentalRequest(requestData) {
    const { artworkUuid, userUuid, address, phoneNumber } = requestData;

    // Find user by UUID
    const user = await this.userRepository.findByUuid(userUuid);
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Find artwork
    const artwork = await this.artworkRepository.findByUuid(artworkUuid);
    if (!artwork) {
      const error = new Error('Artwork not found');
      error.statusCode = 404;
      throw error;
    }

    // Check availability (no date checking needed - just if it's currently available)
    const isAvailable = await this.rentalRepository.isArtworkAvailable(artwork.id);

    if (!isAvailable) {
      const error = new Error('Artwork is currently not available for rental');
      error.statusCode = 409;
      throw error;
    }

    // Set rental date to today and expected return to 1 month from now
    const rentalDate = new Date();
    const expectedReturnDate = new Date();
    expectedReturnDate.setMonth(expectedReturnDate.getMonth() + 1);

    // Create rental request
    const rental = await this.rentalRepository.create({
      uuid: uuidv4(),
      artwork_id: artwork.id,
      user_id: user.id,
      address,
      phone_number: phoneNumber,
      start_date: rentalDate.toISOString().split('T')[0],
      end_date: expectedReturnDate.toISOString().split('T')[0],
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
  async approveRental(uuid, adminUserUuid) {
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

    // Find admin user
    const adminUser = await this.userRepository.findByUuid(adminUserUuid);
    if (!adminUser) {
      const error = new Error('Admin user not found');
      error.statusCode = 404;
      throw error;
    }

    // Get user and artwork details for email
    const user = await this.userRepository.findById(rental.user_id);
    const artwork = await this.artworkRepository.findById(rental.artwork_id);

    await this.rentalRepository.update(uuid, {
      status: 'approved',
      approved_by: adminUser.id,
      approved_at: new Date()
    });

    // Send approval email to user
    try {
      await this.emailService.sendRentalApprovalEmail(user, artwork, rental);
    } catch (emailError) {
      console.error('Failed to send rental approval email:', emailError);
      // Don't throw error - rental was approved successfully
    }

    return await this.rentalRepository.findByUuid(uuid);
  }

  /**
   * Reject rental request (admin)
   */
  async rejectRental(uuid, adminUserUuid) {
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

    // Get user and artwork details for email
    const user = await this.userRepository.findById(rental.user_id);
    const artwork = await this.artworkRepository.findById(rental.artwork_id);

    await this.rentalRepository.update(uuid, {
      status: 'rejected'
    });

    // Send rejection email to user
    try {
      await this.emailService.sendRentalRejectionEmail(user, artwork, rental);
    } catch (emailError) {
      console.error('Failed to send rental rejection email:', emailError);
      // Don't throw error - rental was rejected successfully
    }

    return await this.rentalRepository.findByUuid(uuid);
  }

  /**
   * Finalize rental (admin - artwork returned)
   */
  async finalizeRental(uuid, adminUserUuid) {
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

    // Find admin user
    const adminUser = await this.userRepository.findByUuid(adminUserUuid);
    if (!adminUser) {
      const error = new Error('Admin user not found');
      error.statusCode = 404;
      throw error;
    }

    await this.rentalRepository.update(uuid, {
      status: 'finalized',
      finalized_by: adminUser.id,
      finalized_at: new Date()
    });

    return await this.rentalRepository.findByUuid(uuid);
  }

  /**
   * Check if artwork is available for rental
   */
  async checkArtworkAvailability(artworkUuid) {
    const artwork = await this.artworkRepository.findByUuid(artworkUuid);
    if (!artwork) {
      const error = new Error('Artwork not found');
      error.statusCode = 404;
      throw error;
    }

    const isAvailable = await this.rentalRepository.isArtworkAvailable(artwork.id);

    return { available: isAvailable };
  }
}

module.exports = RentalService;

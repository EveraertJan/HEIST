const { HTTP_STATUS } = require('./errorHandler');
const container = require('../container');

/**
 * Middleware to check if user is admin OR creator of the artwork associated with a rental
 * Must be used after decodeToken middleware
 * Checks rental -> artwork -> created_by_user_id
 */
async function requireArtworkCreatorOrAdmin(req, res, next) {
  if (!req.user) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Admins always pass
  if (req.user.is_admin) {
    return next();
  }

  // For non-admins, check if they own the artwork
  const { uuid } = req.params; // rental UUID

  try {
    const rentalRepository = container.get('rentalRepository');
    const rental = await rentalRepository.findByUuid(uuid);

    if (!rental) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Rental not found'
      });
    }

    const artworkRepository = container.get('artworkRepository');
    const artwork = await artworkRepository.findById(rental.artwork_id);

    if (!artwork) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: 'Artwork not found'
      });
    }

    // Check if user created this artwork
    const userRepository = container.get('userRepository');
    const user = await userRepository.findByUuid(req.user.uuid);

    if (artwork.created_by_user_id === user.id) {
      return next();
    }

    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'You can only manage rentals for your own artworks'
    });
  } catch (error) {
    console.error('Permission check error:', error);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to verify permissions'
    });
  }
}

module.exports = { requireArtworkCreatorOrAdmin };

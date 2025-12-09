const express = require('express');
const router = express.Router();
const container = require('../container');
const { decodeToken } = require('../helpers/authHelpers');
const { requireAdmin } = require('../middleware/adminMiddleware');
const { requireArtworkCreatorOrAdmin } = require('../middleware/artworkMiddleware');
const { asyncHandler, HTTP_STATUS } = require('../middleware/errorHandler');
const {
  validateRequiredFields,
  sanitizeText
} = require('../middleware/validation');

/**
 * @route GET /rentals/my-rentals
 * @description Get current user's rental requests
 * @access Protected
 */
router.get('/my-rentals', decodeToken, asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  const rentalService = container.get('rentalService');
  const userRepository = container.get('userRepository');

  // Find user by UUID to get database ID
  const user = await userRepository.findByUuid(req.user.uuid);
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      success: false,
      message: 'User not found'
    });
  }

  const rentals = await rentalService.getUserRentals(user.id, limit, offset);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: rentals
  });
}));

/**
 * @route GET /rentals/my-artworks-rentals
 * @description Get rental requests for artworks created by current user
 * @access Protected
 */
router.get('/my-artworks-rentals', decodeToken, asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  const rentalService = container.get('rentalService');
  const rentals = await rentalService.getRentalsForUserArtworks(req.user.uuid, limit, offset);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: rentals,
    pagination: { limit, offset, count: rentals.length }
  });
}));

/**
 * @route GET /rentals/pending
 * @description Get all pending rental requests (admin)
 * @access Protected (admin only)
 */
router.get('/pending', decodeToken, requireAdmin, asyncHandler(async (req, res) => {
  const rentalService = container.get('rentalService');
  const rentals = await rentalService.getPendingRequests();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: rentals
  });
}));

/**
 * @route GET /rentals
 * @description Get all rentals (admin)
 * @access Protected (admin only)
 */
router.get('/', decodeToken, requireAdmin, asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  const rentalService = container.get('rentalService');
  const rentals = await rentalService.getAllRentals(limit, offset);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: rentals,
    pagination: {
      limit,
      offset,
      count: rentals.length
    }
  });
}));

/**
 * @route GET /rentals/:uuid
 * @description Get rental details
 * @access Protected
 */
router.get('/:uuid', decodeToken, asyncHandler(async (req, res) => {
  const { uuid } = req.params;

  const rentalService = container.get('rentalService');
  const rental = await rentalService.getRentalByUuid(uuid);

  // Users can only see their own rentals, admins can see all
  if (!req.user.is_admin && rental.user_id !== req.user.id) {
    return res.status(HTTP_STATUS.FORBIDDEN).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: rental
  });
}));

/**
 * @route GET /rentals/check-availability/:uuid
 * @description Check if artwork is available for rental
 * @access Public
 */
router.get('/check-availability/:uuid',
  asyncHandler(async (req, res) => {
    const { uuid } = req.params;

    const rentalService = container.get('rentalService');
    const result = await rentalService.checkArtworkAvailability(uuid);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result
    });
  })
);

/**
 * @route POST /rentals
 * @description Create a rental request
 * @access Protected
 */
router.post('/',
  decodeToken,
  validateRequiredFields(['artworkUuid', 'address', 'phoneNumber']),
  sanitizeText(['address', 'phoneNumber'], 500),
  asyncHandler(async (req, res) => {
    const { artworkUuid, address, phoneNumber } = req.body;

    const rentalService = container.get('rentalService');
    const rental = await rentalService.createRentalRequest({
      artworkUuid,
      userUuid: req.user.uuid,
      address,
      phoneNumber
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: rental,
      message: 'Rental request created successfully'
    });
  })
);

/**
 * @route PUT /rentals/:uuid/approve
 * @description Approve a rental request (admin or artwork creator)
 * @access Protected (admin or artwork creator)
 */
router.put('/:uuid/approve',
  decodeToken,
  requireArtworkCreatorOrAdmin,
  asyncHandler(async (req, res) => {
    const { uuid } = req.params;

    const rentalService = container.get('rentalService');
    const rental = await rentalService.approveRental(uuid, req.user.uuid);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: rental,
      message: 'Rental approved successfully'
    });
  })
);

/**
 * @route PUT /rentals/:uuid/reject
 * @description Reject a rental request (admin or artwork creator)
 * @access Protected (admin or artwork creator)
 */
router.put('/:uuid/reject',
  decodeToken,
  requireArtworkCreatorOrAdmin,
  asyncHandler(async (req, res) => {
    const { uuid } = req.params;

    const rentalService = container.get('rentalService');
    const rental = await rentalService.rejectRental(uuid, req.user.uuid);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: rental,
      message: 'Rental rejected'
    });
  })
);

/**
 * @route PUT /rentals/:uuid/finalize
 * @description Mark rental as finalized (admin or artwork creator)
 * @access Protected (admin or artwork creator)
 */
router.put('/:uuid/finalize',
  decodeToken,
  requireArtworkCreatorOrAdmin,
  asyncHandler(async (req, res) => {
    const { uuid } = req.params;

    const rentalService = container.get('rentalService');
    const rental = await rentalService.finalizeRental(uuid, req.user.uuid);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: rental,
      message: 'Rental finalized successfully'
    });
  })
);

module.exports = router;

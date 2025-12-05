const express = require('express');
const router = express.Router();
const container = require('../container');
const { decodeToken } = require('../helpers/authHelpers');
const { requireAdmin } = require('../middleware/adminMiddleware');
const { asyncHandler, HTTP_STATUS } = require('../middleware/errorHandler');
const {
  validateRequiredFields,
  sanitizeText
} = require('../middleware/validation');

/**
 * @route GET /mediums
 * @description Get all mediums
 * @access Public
 * @returns {Array} Array of medium objects
 */
router.get('/', asyncHandler(async (req, res) => {
  const artworkService = container.get('artworkService');
  const mediums = await artworkService.getAllMediums();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: mediums
  });
}));

/**
 * @route POST /mediums
 * @description Create a new medium
 * @access Protected (requires authentication)
 * @headers {string} Authorization - Bearer token
 * @body {string} name - Medium name
 * @returns {Object} Created medium object
 * @throws {ValidationError} 400 - Missing or invalid fields
 * @throws {AuthenticationError} 401 - Invalid or missing token
 * @throws {ConflictError} 409 - Medium already exists
 */
router.post(
  '/',
  decodeToken,
  requireAdmin,
  validateRequiredFields(['name']),
  sanitizeText(['name'], 100),
  asyncHandler(async (req, res) => {

    const { name } = req.body;

    const artworkService = container.get('artworkService');
    const medium = await artworkService.createMedium({ name });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: medium,
      message: 'Medium created successfully'
    });
  })
);

module.exports = router;

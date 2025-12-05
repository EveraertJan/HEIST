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
 * @route GET /artworks
 * @description Get all artworks with pagination
 * @access Public
 * @query {number} limit - Maximum number of results (default: 50)
 * @query {number} offset - Offset for pagination (default: 0)
 * @returns {Array} Array of artwork objects
 */
router.get('/', asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  const artworkService = container.get('artworkService');
  const artworks = await artworkService.getAllArtworks(limit, offset);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: artworks,
    pagination: {
      limit,
      offset,
      count: artworks.length
    }
  });
}));

/**
 * @route GET /artworks/search
 * @description Search artworks by title, artist name, or filter by mediums
 * @access Public
 * @query {string} search - Search term for title or artist name
 * @query {string} mediums - Comma-separated medium UUIDs
 * @query {number} limit - Maximum number of results (default: 50)
 * @query {number} offset - Offset for pagination (default: 0)
 * @returns {Array} Array of matching artwork objects
 */
router.get('/search', asyncHandler(async (req, res) => {
  const { search, mediums } = req.query;
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;

  const filters = {
    limit,
    offset
  };

  if (search) {
    filters.search = search.trim();
  }

  if (mediums) {
    filters.mediums = mediums.split(',').map(m => m.trim()).filter(m => m);
  }

  const artworkService = container.get('artworkService');
  const artworks = await artworkService.searchArtworks(filters);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: artworks,
    filters: {
      search: filters.search || null,
      mediums: filters.mediums || []
    },
    pagination: {
      limit,
      offset,
      count: artworks.length
    }
  });
}));

/**
 * @route GET /artworks/:uuid
 * @description Get artwork details by UUID
 * @access Public
 * @param {string} uuid - Artwork UUID
 * @returns {Object} Artwork object with artists and mediums
 * @throws {NotFoundError} 404 - Artwork not found
 */
router.get('/:uuid', asyncHandler(async (req, res) => {
  const { uuid } = req.params;

  const artworkService = container.get('artworkService');
  const artwork = await artworkService.getArtworkByUuid(uuid);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: artwork
  });
}));

/**
 * @route POST /artworks
 * @description Create a new artwork
 * @access Protected (requires authentication)
 * @headers {string} Authorization - Bearer token
 * @body {string} title - Artwork title
 * @body {string} [description] - Artwork description
 * @body {string} [size] - Artwork size
 * @body {Array<string>} artistUuids - Array of artist UUIDs
 * @body {Array<string>} [mediumUuids] - Array of medium UUIDs
 * @returns {Object} Created artwork object
 * @throws {ValidationError} 400 - Missing or invalid fields
 * @throws {AuthenticationError} 401 - Invalid or missing token
 */
router.post(
  '/',
  decodeToken,
  requireAdmin,
  validateRequiredFields(['title', 'artistUuids']),
  sanitizeText(['title', 'description', 'size'], 1000),
  asyncHandler(async (req, res) => {

    const { title, description, size, artistUuids, mediumUuids } = req.body;

    const artworkService = container.get('artworkService');
    const artwork = await artworkService.createArtwork({
      title,
      description,
      size,
      artistUuids,
      mediumUuids: mediumUuids || []
    });

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      data: artwork,
      message: 'Artwork created successfully'
    });
  })
);

/**
 * @route PUT /artworks/:uuid
 * @description Update an artwork
 * @access Protected (requires authentication)
 * @headers {string} Authorization - Bearer token
 * @param {string} uuid - Artwork UUID
 * @body {string} [title] - New title
 * @body {string} [description] - New description
 * @body {string} [size] - New size
 * @returns {Object} Updated artwork object
 * @throws {ValidationError} 400 - Invalid fields
 * @throws {AuthenticationError} 401 - Invalid or missing token
 * @throws {NotFoundError} 404 - Artwork not found
 */
router.put(
  '/:uuid',
  decodeToken,
  requireAdmin,
  sanitizeText(['title', 'description', 'size'], 1000),
  asyncHandler(async (req, res) => {

    const { uuid } = req.params;
    const { title, description, size } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (size !== undefined) updates.size = size;

    const artworkService = container.get('artworkService');
    const artwork = await artworkService.updateArtwork(uuid, updates);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: artwork,
      message: 'Artwork updated successfully'
    });
  })
);

/**
 * @route DELETE /artworks/:uuid
 * @description Delete an artwork
 * @access Protected (requires authentication)
 * @headers {string} Authorization - Bearer token
 * @param {string} uuid - Artwork UUID
 * @returns {Object} Success message
 * @throws {AuthenticationError} 401 - Invalid or missing token
 * @throws {NotFoundError} 404 - Artwork not found
 */
router.delete(
  '/:uuid',
  decodeToken,
  requireAdmin,
  asyncHandler(async (req, res) => {

    const { uuid } = req.params;

    const artworkService = container.get('artworkService');
    await artworkService.deleteArtwork(uuid);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Artwork deleted successfully'
    });
  })
);

module.exports = router;

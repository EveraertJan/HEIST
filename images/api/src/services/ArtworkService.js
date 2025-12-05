const { v4: uuidv4 } = require('uuid');

/**
 * ArtworkService - Business logic layer for artwork-related operations
 * Implements Single Responsibility Principle by separating business logic from HTTP layer
 * @class
 */
class ArtworkService {
  /**
   * Creates an instance of ArtworkService
   * @param {Object} artworkRepository - ArtworkRepository instance
   * @param {Object} mediumRepository - MediumRepository instance
   * @param {Object} userRepository - UserRepository instance
   * @param {Object} fileStorageService - FileStorageService instance
   * @param {Object} db - Database instance (for transactions)
   */
  constructor(artworkRepository, mediumRepository, userRepository, fileStorageService, db) {
    this.artworkRepository = artworkRepository;
    this.mediumRepository = mediumRepository;
    this.userRepository = userRepository;
    this.fileStorageService = fileStorageService;
    this.db = db;
  }

  /**
   * Get all artworks with pagination
   * @param {number} limit - Maximum number of results
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Array>} Array of artworks
   */
  async getAllArtworks(limit = 50, offset = 0) {
    return await this.artworkRepository.findAll(limit, offset);
  }

  /**
   * Get artwork details by UUID
   * @param {string} uuid - Artwork UUID
   * @returns {Promise<Object>} Artwork with related data
   * @throws {Error} If artwork not found
   */
  async getArtworkByUuid(uuid) {
    const artwork = await this.artworkRepository.findByUuid(uuid);

    if (!artwork) {
      const error = new Error('Artwork not found');
      error.statusCode = 404;
      throw error;
    }

    return artwork;
  }

  /**
   * Search artworks by filters
   * @param {Object} filters - Search filters
   * @param {string} [filters.search] - Search term
   * @param {Array<string>} [filters.mediums] - Medium UUIDs
   * @param {number} [filters.limit] - Results limit
   * @param {number} [filters.offset] - Results offset
   * @returns {Promise<Array>} Array of matching artworks
   */
  async searchArtworks(filters) {
    return await this.artworkRepository.search(filters);
  }

  /**
   * Create a new artwork with artists and mediums
   * @param {Object} artworkData - Artwork data
   * @param {string} artworkData.title - Artwork title
   * @param {string} [artworkData.description] - Artwork description
   * @param {string} [artworkData.width] - Artwork width
   * @param {string} [artworkData.height] - Artwork height
   * @param {string} [artworkData.depth] - Artwork depth
   * @param {Array<string>} artworkData.artistUuids - Array of artist UUIDs
   * @param {Array<string>} artworkData.mediumUuids - Array of medium UUIDs
   * @returns {Promise<Object>} Created artwork with relations
   * @throws {Error} If validation fails or artists/mediums not found
   */
  async createArtwork(artworkData) {
    const { title, description, width, height, depth, artistUuids = [], mediumUuids = [] } = artworkData;

    // Validate required fields
    if (!title || title.trim().length === 0) {
      const error = new Error('Title is required');
      error.statusCode = 400;
      throw error;
    }

    if (!artistUuids || artistUuids.length === 0) {
      const error = new Error('At least one artist is required');
      error.statusCode = 400;
      throw error;
    }

    // Use transaction to ensure data consistency
    const trx = await this.db.transaction();

    try {
      // Create the artwork
      const artwork = await trx('artworks')
        .insert({
          uuid: uuidv4(),
          title: title.trim(),
          description: description ? description.trim() : null,
          width: width ? width.trim() : null,
          height: height ? height.trim() : null,
          depth: depth ? depth.trim() : null
        })
        .returning('*')
        .then(rows => rows[0]);

      // Add artists
      for (const artistUuid of artistUuids) {
        const artist = await trx('users').where({ uuid: artistUuid }).first();

        if (!artist) {
          throw new Error(`Artist with UUID ${artistUuid} not found`);
        }

        await trx('artworks_artists').insert({
          uuid: uuidv4(),
          artwork_id: artwork.id,
          artist_id: artist.id
        });
      }

      // Add mediums
      for (const mediumUuid of mediumUuids) {
        const medium = await trx('mediums').where({ uuid: mediumUuid }).first();

        if (!medium) {
          throw new Error(`Medium with UUID ${mediumUuid} not found`);
        }

        await trx('artworks_mediums').insert({
          uuid: uuidv4(),
          artwork_id: artwork.id,
          medium_id: medium.id
        });
      }

      await trx.commit();

      // Return the complete artwork with relations
      return await this.artworkRepository.findByUuid(artwork.uuid);
    } catch (error) {
      await trx.rollback();
      const err = new Error(error.message || 'Failed to create artwork');
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  /**
   * Update an artwork
   * @param {string} uuid - Artwork UUID
   * @param {Object} updates - Fields to update
   * @param {string} [updates.title] - New title
   * @param {string} [updates.description] - New description
   * @param {string} [updates.width] - New width
   * @param {string} [updates.height] - New height
   * @param {string} [updates.depth] - New depth
   * @returns {Promise<Object>} Updated artwork
   * @throws {Error} If artwork not found
   */
  async updateArtwork(uuid, updates) {
    const artwork = await this.artworkRepository.findByUuid(uuid);

    if (!artwork) {
      const error = new Error('Artwork not found');
      error.statusCode = 404;
      throw error;
    }

    const updatedArtwork = await this.artworkRepository.update(uuid, updates);
    return await this.artworkRepository.findByUuid(uuid);
  }

  /**
   * Delete an artwork
   * @param {string} uuid - Artwork UUID
   * @returns {Promise<boolean>} True if deleted
   * @throws {Error} If artwork not found
   */
  async deleteArtwork(uuid) {
    const artwork = await this.artworkRepository.findByUuid(uuid);

    if (!artwork) {
      const error = new Error('Artwork not found');
      error.statusCode = 404;
      throw error;
    }

    return await this.artworkRepository.delete(uuid);
  }

  /**
   * Get all available mediums
   * @returns {Promise<Array>} Array of mediums
   */
  async getAllMediums() {
    return await this.mediumRepository.findAll();
  }

  /**
   * Create a new medium
   * @param {Object} mediumData - Medium data
   * @param {string} mediumData.name - Medium name
   * @returns {Promise<Object>} Created medium
   * @throws {Error} If validation fails or medium already exists
   */
  async createMedium(mediumData) {
    const { name } = mediumData;

    if (!name || name.trim().length === 0) {
      const error = new Error('Medium name is required');
      error.statusCode = 400;
      throw error;
    }

    // Check if medium already exists
    const existing = await this.mediumRepository.findByName(name.trim());
    if (existing) {
      const error = new Error('Medium with this name already exists');
      error.statusCode = 409;
      throw error;
    }

    return await this.mediumRepository.create({
      uuid: uuidv4(),
      name: name.trim()
    });
  }

  /**
   * Add images to an artwork
   * @param {string} artworkUuid - Artwork UUID
   * @param {Array<Object>} files - Array of uploaded files from multer
   * @param {Array<string>} [descriptions] - Array of image descriptions
   * @returns {Promise<Array>} Array of created image objects
   * @throws {Error} If artwork not found or file upload fails
   */
  async addArtworkImages(artworkUuid, files, descriptions = []) {
    const artwork = await this.artworkRepository.findByUuid(artworkUuid);

    if (!artwork) {
      const error = new Error('Artwork not found');
      error.statusCode = 404;
      throw error;
    }

    const trx = await this.db.transaction();
    const uploadedImages = [];

    try {
      // Ensure artwork images directory exists
      await this.fileStorageService.createSubdirectory('artwork-images');

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Generate safe filename
        const safeFilename = this.fileStorageService.generateSafeFilename(file.originalname);

        // Move file from temp location to permanent location
        // file.path is the absolute path where multer saved the file
        const fs = require('fs').promises;
        const path = require('path');
        const permanentPath = `artwork-images/${safeFilename}`;
        const fullPermanentPath = this.fileStorageService.getFilePath(permanentPath);
        await fs.rename(file.path, fullPermanentPath);

        // Get next sort order
        const maxSortOrder = await trx('artwork_images')
          .where('artwork_id', artwork.id)
          .max('sort_order as max_sort')
          .first();
        
        const sortOrder = (maxSortOrder?.max_sort || 0) + 1;

        // Create database record
        const imageRecord = await trx('artwork_images')
          .insert({
            uuid: uuidv4(),
            artwork_id: artwork.id,
            filename: permanentPath,
            original_filename: file.originalname,
            mime_type: file.mimetype,
            file_size: file.size,
            description: descriptions[i] || null,
            sort_order: sortOrder
          })
          .returning('*')
          .then(rows => rows[0]);

        uploadedImages.push(imageRecord);
      }

      await trx.commit();

      return uploadedImages;
    } catch (error) {
      await trx.rollback();

      // Clean up uploaded files on error
      const fs = require('fs').promises;
      for (const file of files) {
        try {
          // Try to delete from temp location (file.path) if it still exists
          if (file.path) {
            await fs.unlink(file.path).catch(() => {});
          }
        } catch (cleanupError) {
          console.error('Failed to cleanup file:', file.filename, cleanupError);
        }
      }

      const err = new Error(error.message || 'Failed to upload images');
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  /**
   * Delete an artwork image
   * @param {string} artworkUuid - Artwork UUID
   * @param {string} imageUuid - Image UUID
   * @returns {Promise<boolean>} True if deleted
   * @throws {Error} If artwork or image not found
   */
  async deleteArtworkImage(artworkUuid, imageUuid) {
    const artwork = await this.artworkRepository.findByUuid(artworkUuid);

    if (!artwork) {
      const error = new Error('Artwork not found');
      error.statusCode = 404;
      throw error;
    }

    const trx = await this.db.transaction();

    try {
      // Get image record
      const image = await trx('artwork_images')
        .where({
          uuid: imageUuid,
          artwork_id: artwork.id
        })
        .first();

      if (!image) {
        await trx.rollback();
        const error = new Error('Image not found');
        error.statusCode = 404;
        throw error;
      }

      // Delete database record
      await trx('artwork_images')
        .where({
          uuid: imageUuid,
          artwork_id: artwork.id
        })
        .del();

      // Delete file
      await this.fileStorageService.deleteFile(image.filename);

      await trx.commit();
      return true;
    } catch (error) {
      await trx.rollback();
      const err = new Error(error.message || 'Failed to delete image');
      err.statusCode = error.statusCode || 500;
      throw err;
    }
  }

  /**
   * Update an artwork image
   * @param {string} artworkUuid - Artwork UUID
   * @param {string} imageUuid - Image UUID
   * @param {Object} updates - Fields to update
   * @param {string} [updates.description] - New description
   * @param {number} [updates.sort_order] - New sort order
   * @returns {Promise<Object>} Updated image object
   * @throws {Error} If artwork or image not found
   */
  async updateArtworkImage(artworkUuid, imageUuid, updates) {
    const artwork = await this.artworkRepository.findByUuid(artworkUuid);

    if (!artwork) {
      const error = new Error('Artwork not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if image exists
    const existingImage = await this.db('artwork_images')
      .where({
        uuid: imageUuid,
        artwork_id: artwork.id
      })
      .first();

    if (!existingImage) {
      const error = new Error('Image not found');
      error.statusCode = 404;
      throw error;
    }

    // Update image
    const [updatedImage] = await this.db('artwork_images')
      .where({
        uuid: imageUuid,
        artwork_id: artwork.id
      })
      .update(updates)
      .returning('*');

    return updatedImage;
  }
}

module.exports = ArtworkService;

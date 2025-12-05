/**
 * Service Container
 * Implements Dependency Inversion Principle by managing service instantiation
 * Provides centralized dependency injection
 */

const config = require('./config');
const pg = require('./db/db.js');

// Repositories
const UserRepository = require('./repositories/UserRepository');
const ArtworkRepository = require('./repositories/ArtworkRepository');
const MediumRepository = require('./repositories/MediumRepository');
const RentalRepository = require('./repositories/RentalRepository');

// Services
const FileStorageService = require('./services/FileStorageService');
const EmailService = require('./services/EmailService');
const UserService = require('./services/UserService');
const ArtworkService = require('./services/ArtworkService');
const RentalService = require('./services/RentalService');

/**
 * Service Container Class
 * Manages service lifecycle and dependency injection
 */
class Container {
  constructor() {
    this.services = {};
    this.initialized = false;
  }

  /**
   * Initialize all services with proper dependencies
   */
  initialize() {
    if (this.initialized) {
      return;
    }

    const db = pg.get();

    // Initialize Repositories
    this.services.userRepository = new UserRepository(db);
    this.services.artworkRepository = new ArtworkRepository(db);
    this.services.mediumRepository = new MediumRepository(db);
    this.services.rentalRepository = new RentalRepository(db);

    this.services.fileStorageService = new FileStorageService(
      config.upload.directory
    );

    this.services.emailService = new EmailService({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: config.email.auth,
      from: config.email.from
    });

    // Initialize Domain Services
    this.services.userService = new UserService(
      this.services.userRepository,
      this.services.fileStorageService,
      db,
      {
        jwtSecret: config.auth.jwtSecret,
        saltRounds: config.auth.saltRounds
      }
    );

    this.services.artworkService = new ArtworkService(
      this.services.artworkRepository,
      this.services.mediumRepository,
      this.services.userRepository,
      this.services.fileStorageService,
      db
    );

    this.services.rentalService = new RentalService(
      this.services.rentalRepository,
      this.services.artworkRepository,
      this.services.userRepository
    );

    this.initialized = true;
  }

  /**
   * Get a service by name
   * @param {string} serviceName - Name of the service
   * @returns {Object} Service instance
   * @throws {Error} If service not found
   */
  get(serviceName) {
    if (!this.initialized) {
      this.initialize();
    }

    if (!this.services[serviceName]) {
      throw new Error(`Service '${serviceName}' not found in container`);
    }

    return this.services[serviceName];
  }

  /**
   * Get all services
   * @returns {Object} Object containing all services
   */
  getAll() {
    if (!this.initialized) {
      this.initialize();
    }

    return { ...this.services };
  }

  /**
   * Check if container has a service
   * @param {string} serviceName - Name of the service
   * @returns {boolean} True if service exists
   */
  has(serviceName) {
    if (!this.initialized) {
      this.initialize();
    }

    return !!this.services[serviceName];
  }

  /**
   * Reset container (mainly for testing)
   */
  reset() {
    this.services = {};
    this.initialized = false;
  }
}

// Create singleton instance
const container = new Container();

module.exports = container;

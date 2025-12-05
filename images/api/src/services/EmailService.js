const nodemailer = require('nodemailer');

/**
 * EmailService - Abstracts email sending functionality
 * Implements Dependency Inversion Principle by providing an interface for email operations
 * Makes it easy to swap email providers or configurations
 * @class
 */
class EmailService {
  /**
   * Creates an instance of EmailService
   * @param {Object} config - Email configuration
   * @param {string} config.host - SMTP host
   * @param {number} config.port - SMTP port
   * @param {boolean} config.secure - Use TLS
   * @param {Object} config.auth - Authentication credentials
   * @param {string} config.auth.user - SMTP username
   * @param {string} config.auth.pass - SMTP password
   * @param {string} config.from - Default sender email address
   */
  constructor(config) {
    this.config = config;
    this.transporter = this.createTransporter();
  }

  /**
   * Create nodemailer transporter
   * @private
   * @returns {Object} Nodemailer transporter
   */
  createTransporter() {
    return nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: {
        user: this.config.auth.user,
        pass: this.config.auth.pass
      }
    });
  }

  /**
   * Send an email
   * @param {Object} emailData - Email data
   * @param {string} emailData.to - Recipient email address
   * @param {string} emailData.subject - Email subject
   * @param {string} [emailData.text] - Plain text body
   * @param {string} [emailData.html] - HTML body
   * @param {string} [emailData.from] - Sender email (overrides default)
   * @param {string} [emailData.replyTo] - Reply-to email address
   * @returns {Promise<Object>} Nodemailer send result
   * @throws {Error} Email sending error
   */
  async sendEmail(emailData) {
    const mailOptions = {
      from: emailData.from || this.config.from,
      to: emailData.to,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
      replyTo: emailData.replyTo
    };

    return await this.transporter.sendMail(mailOptions);
  }

  /**
   * Send contact form email
   * @param {Object} contactData - Contact form data
   * @param {string} contactData.name - Sender's name
   * @param {string} contactData.email - Sender's email
   * @param {string} contactData.message - Message content
   * @param {string} recipientEmail - Email address to send to
   * @returns {Promise<Object>} Nodemailer send result
   * @throws {Error} Email sending error
   */
  async sendContactForm(contactData, recipientEmail) {
    const { name, email, message } = contactData;

    const emailData = {
      to: recipientEmail,
      subject: `Contact Form Submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
      html: `
        <h2>Contact Form Submission</h2>
        <p><strong>Name:</strong> ${this.escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${this.escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <p>${this.escapeHtml(message).replace(/\n/g, '<br>')}</p>
      `,
      replyTo: email
    };

    return await this.sendEmail(emailData);
  }

  /**
   * Send welcome email to new user
   * @param {string} recipientEmail - User's email address
   * @param {string} recipientName - User's name
   * @returns {Promise<Object>} Nodemailer send result
   * @throws {Error} Email sending error
   */
  async sendWelcomeEmail(recipientEmail, recipientName) {
    const emailData = {
      to: recipientEmail,
      subject: 'Welcome to Checkpoint!',
      text: `Hello ${recipientName},\n\nWelcome to Checkpoint! We're glad to have you here.\n\nBest regards,\nThe Checkpoint Team`,
      html: `
        <h2>Welcome to Checkpoint!</h2>
        <p>Hello ${this.escapeHtml(recipientName)},</p>
        <p>Welcome to Checkpoint! We're glad to have you here.</p>
        <p>Best regards,<br>The Checkpoint Team</p>
      `
    };

    return await this.sendEmail(emailData);
  }

  /**
   * Send password reset email
   * @param {string} recipientEmail - User's email address
   * @param {string} recipientName - User's name
   * @param {string} resetLink - Password reset link
   * @returns {Promise<Object>} Nodemailer send result
   * @throws {Error} Email sending error
   */
  async sendPasswordResetEmail(recipientEmail, recipientName, resetLink) {
    const emailData = {
      to: recipientEmail,
      subject: 'Password Reset Request',
      text: `Hello ${recipientName},\n\nYou requested to reset your password. Click the link below to reset it:\n\n${resetLink}\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe Checkpoint Team`,
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${this.escapeHtml(recipientName)},</p>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        <p><a href="${this.escapeHtml(resetLink)}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a></p>
        <p>Or copy and paste this link into your browser:<br>${this.escapeHtml(resetLink)}</p>
        <p>If you didn't request this, Please ignore this email.</p>
        <p>Best regards,<br>The Checkpoint Team</p>
      `
    };

    return await this.sendEmail(emailData);
  }

  /**
   * Send new rental request notification to admin
   * @param {Object} user - User object
   * @param {Object} artwork - Artwork object
   * @param {Object} rental - Rental object
   * @param {string} adminEmail - Admin email address
   * @returns {Promise<Object>} Nodemailer send result
   * @throws {Error} Email sending error
   */
  async sendNewRentalRequestEmail(user, artwork, rental, adminEmail) {
    const userName = `${user.first_name} ${user.last_name}`;
    const requestDate = new Date(rental.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const emailData = {
      to: adminEmail,
      subject: `🎨 New Artwork Rental Request: "${artwork.title}"`,
      text: `A new rental request has been submitted.\n\nRequest Details:\n- User: ${userName} (${user.email})\n- Artwork: ${artwork.title}\n- Request Date: ${requestDate}\n- Delivery Address: ${rental.address}\n- Phone: ${rental.phone_number}\n\nPlease review and approve or reject this request in the admin panel.`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;">
          <div style="background: linear-gradient(135deg, #C2FE0B, #4a9eff); padding: 40px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: #000000; margin: 0; font-size: 28px; font-weight: 700;">🎨 New Rental Request</h1>
          </div>
          
          <div style="background: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #e0e0e0;">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">A new artwork rental request has been submitted!</h2>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #C2FE0B;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Request Details:</h3>
              
              <div style="display: grid; grid-template-columns: 140px 1fr; gap: 10px; margin-bottom: 15px;">
                <strong style="color: #666;">Customer:</strong>
                <span style="color: #333;">${this.escapeHtml(userName)}</span>
              </div>
              
              <div style="display: grid; grid-template-columns: 140px 1fr; gap: 10px; margin-bottom: 15px;">
                <strong style="color: #666;">Email:</strong>
                <span style="color: #333;">${this.escapeHtml(user.email)}</span>
              </div>
              
              <div style="display: grid; grid-template-columns: 140px 1fr; gap: 10px; margin-bottom: 15px;">
                <strong style="color: #666;">Artwork:</strong>
                <span style="color: #333; font-weight: 600;">${this.escapeHtml(artwork.title)}</span>
              </div>
              
              <div style="display: grid; grid-template-columns: 140px 1fr; gap: 10px; margin-bottom: 15px;">
                <strong style="color: #666;">Request Date:</strong>
                <span style="color: #333;">${requestDate}</span>
              </div>
              
              <div style="display: grid; grid-template-columns: 140px 1fr; gap: 10px; margin-bottom: 15px;">
                <strong style="color: #666;">Delivery Address:</strong>
                <span style="color: #333;">${this.escapeHtml(rental.address)}</span>
              </div>
              
              <div style="display: grid; grid-template-columns: 140px 1fr; gap: 10px;">
                <strong style="color: #666;">Phone:</strong>
                <span style="color: #333;">${this.escapeHtml(rental.phone_number)}</span>
              </div>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
              <p style="color: #2d5a2d; margin: 0; font-size: 16px; font-weight: 500;">
                ⚡ Please review this request and approve or reject it in the admin panel.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e0e0e0;">
              <p style="color: #666; margin: 0; font-size: 14px;">
                This is an automated notification from the HEIST Art Rental System.
              </p>
            </div>
          </div>
        </div>
      `
    };

    return await this.sendEmail(emailData);
  }

  /**
   * Send rental approval email
   * @param {Object} user - User object
   * @param {Object} artwork - Artwork object
   * @param {Object} rental - Rental object
   * @returns {Promise<Object>} Nodemailer send result
   * @throws {Error} Email sending error
   */
  async sendRentalApprovalEmail(user, artwork, rental) {
    const userName = `${user.first_name} ${user.last_name}`;
    const rentalDate = new Date(rental.approved_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const expectedReturnDate = new Date(rental.expected_return_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailData = {
      to: user.email,
      subject: 'Your Artwork Rental Request Has Been Approved!',
      text: `Dear ${userName},\n\nGreat news! Your rental request for "${artwork.title}" has been approved.\n\nRental Details:\n- Artwork: ${artwork.title}\n- Rental Date: ${rentalDate}\n- Expected Return Date: ${expectedReturnDate}\n- Delivery Address: ${rental.address}\n\nPlease prepare to receive the artwork and ensure the delivery address is accessible. We'll contact you soon with delivery arrangements.\n\nThank you for choosing our art rental service!\n\nBest regards,\nThe HEIST Team`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;">
          <div style="background: linear-gradient(135deg, #4a9eff, #b388ff); padding: 40px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">🎉 Rental Approved!</h1>
          </div>
          
          <div style="background: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #e0e0e0;">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Great News, ${this.escapeHtml(userName)}!</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              Your rental request for <strong style="color: #4a9eff;">"${this.escapeHtml(artwork.title)}"</strong> has been approved!
            </p>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #4a9eff;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Rental Details:</h3>
              
              <div style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; margin-bottom: 15px;">
                <strong style="color: #666;">Artwork:</strong>
                <span style="color: #333;">${this.escapeHtml(artwork.title)}</span>
              </div>
              
              <div style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; margin-bottom: 15px;">
                <strong style="color: #666;">Rental Date:</strong>
                <span style="color: #333;">${rentalDate}</span>
              </div>
              
              <div style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; margin-bottom: 15px;">
                <strong style="color: #666;">Expected Return:</strong>
                <span style="color: #333;">${expectedReturnDate}</span>
              </div>
              
              <div style="display: grid; grid-template-columns: 120px 1fr; gap: 10px;">
                <strong style="color: #666;">Delivery Address:</strong>
                <span style="color: #333;">${this.escapeHtml(rental.address)}</span>
              </div>
            </div>
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
              <p style="color: #1976d2; margin: 0; font-size: 16px; font-weight: 500;">
                📦 Please prepare to receive the artwork and ensure the delivery address is accessible.
              </p>
              <p style="color: #1976d2; margin: 10px 0 0 0; font-size: 16px; font-weight: 500;">
                We'll contact you soon with delivery arrangements.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e0e0e0;">
              <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">
                Thank you for choosing our art rental service!
              </p>
              <p style="color: #333; margin: 0; font-size: 16px; font-weight: 600;">
                Best regards,<br>
                <span style="color: #4a9eff;">The HEIST Team</span>
              </p>
            </div>
          </div>
        </div>
      `
    };

    return await this.sendEmail(emailData);
  }

  /**
   * Send new rental request notification to admin
   * @param {Object} user - User object
   * @param {Object} artwork - Artwork object
   * @param {Object} rental - Rental object
   * @param {string} adminEmail - Admin email address
   * @returns {Promise<Object>} Nodemailer send result
   * @throws {Error} Email sending error
   */
  async sendNewRentalRequestEmail(user, artwork, rental, adminEmail) {
    const userName = `${user.first_name} ${user.last_name}`;
    const requestDate = new Date(rental.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const emailData = {
      to: adminEmail,
      subject: `New Artwork Rental Request: "${artwork.title}"`,
      text: `A new rental request has been submitted.\n\nRequest Details:\n- User: ${userName} (${user.email})\n- Artwork: ${artwork.title}\n- Request Date: ${requestDate}\n- Delivery Address: ${rental.address}\n- Phone: ${rental.phone_number}\n\nPlease review and approve or reject this request in the admin panel.`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;">
          <div style="background: linear-gradient(135deg, #C2FE0B, #4a9eff); padding: 40px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: #000000; margin: 0; font-size: 28px; font-weight: 700;">🎨 New Rental Request</h1>
          </div>
          
          <div style="background: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #e0e0e0;">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">A new artwork rental request has been submitted!</h2>
            
            <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #C2FE0B;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Request Details:</h3>
              
              <div style="display: grid; grid-template-columns: 140px 1fr; gap: 10px; margin-bottom: 15px;">
                <strong style="color: #666;">Customer:</strong>
                <span style="color: #333;">${this.escapeHtml(userName)}</span>
              </div>
              
              <div style="display: grid; grid-template-columns: 140px 1fr; gap: 10px; margin-bottom: 15px;">
                <strong style="color: #666;">Email:</strong>
                <span style="color: #333;">${this.escapeHtml(user.email)}</span>
              </div>
              
              <div style="display: grid; grid-template-columns: 140px 1fr; gap: 10px; margin-bottom: 15px;">
                <strong style="color: #666;">Artwork:</strong>
                <span style="color: #333; font-weight: 600;">${this.escapeHtml(artwork.title)}</span>
              </div>
              
              <div style="display: grid; grid-template-columns: 140px 1fr; gap: 10px; margin-bottom: 15px;">
                <strong style="color: #666;">Request Date:</strong>
                <span style="color: #333;">${requestDate}</span>
              </div>
              
              <div style="display: grid; grid-template-columns: 140px 1fr; gap: 10px; margin-bottom: 15px;">
                <strong style="color: #666;">Delivery Address:</strong>
                <span style="color: #333;">${this.escapeHtml(rental.address)}</span>
              </div>
              
              <div style="display: grid; grid-template-columns: 140px 1fr; gap: 10px;">
                <strong style="color: #666;">Phone:</strong>
                <span style="color: #333;">${this.escapeHtml(rental.phone_number)}</span>
              </div>
            </div>
            
            <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
              <p style="color: #2d5a2d; margin: 0; font-size: 16px; font-weight: 500;">
                ⚡ Please review this request and approve or reject it in the admin panel.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e0e0e0;">
              <p style="color: #666; margin: 0; font-size: 14px;">
                This is an automated notification from the HEIST Art Rental System.
              </p>
            </div>
          </div>
        </div>
      `
    };

    return await this.sendEmail(emailData);
  }

  /**
   * Send rental rejection email
   * @param {Object} user - User object
   * @param {Object} artwork - Artwork object
   * @param {Object} rental - Rental object
   * @returns {Promise<Object>} Nodemailer send result
   * @throws {Error} Email sending error
   */
  async sendRentalRejectionEmail(user, artwork, rental) {
    const userName = `${user.first_name} ${user.last_name}`;
    const requestDate = new Date(rental.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailData = {
      to: user.email,
      subject: 'Update on Your Artwork Rental Request',
      text: `Dear ${userName},\n\nWe regret to inform you that your rental request for "${artwork.title}" has been declined.\n\nRequest Details:\n- Artwork: ${artwork.title}\n- Request Date: ${requestDate}\n\nWe encourage you to continue exploring our collection and submit new rental requests for other artworks.\n\nThank you for your interest in our art rental service.\n\nBest regards,\nThe HEIST Team`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;">
          <div style="background: linear-gradient(135deg, #ff6b9d, #e91e63); padding: 40px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Rental Request Update</h1>
          </div>
          
          <div style="background: #ffffff; padding: 40px; border-radius: 12px; border: 1px solid #e0e0e0;">
            <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Hello ${this.escapeHtml(userName)},</h2>
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
              We regret to inform you that your rental request for <strong style="color: #ff6b9d;">"${this.escapeHtml(artwork.title)}"</strong> has been declined.
            </p>
            
            <div style="background: #fff5f5; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #ff6b9d;">
              <h3 style="color: #333; margin: 0 0 15px 0; font-size: 18px;">Request Details:</h3>
              
              <div style="display: grid; grid-template-columns: 120px 1fr; gap: 10px; margin-bottom: 15px;">
                <strong style="color: #666;">Artwork:</strong>
                <span style="color: #333;">${this.escapeHtml(artwork.title)}</span>
              </div>
              
              <div style="display: grid; grid-template-columns: 120px 1fr; gap: 10px;">
                <strong style="color: #666;">Request Date:</strong>
                <span style="color: #333;">${requestDate}</span>
              </div>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
              <p style="color: #666; margin: 0; font-size: 16px; font-weight: 500;">
                🎨 We encourage you to continue exploring our collection and submit new rental requests for other artworks.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #e0e0e0;">
              <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">
                Thank you for your interest in our art rental service.
              </p>
              <p style="color: #333; margin: 0; font-size: 16px; font-weight: 600;">
                Best regards,<br>
                <span style="color: #ff6b9d;">The HEIST Team</span>
              </p>
            </div>
          </div>
        </div>
      `
    };

    return await this.sendEmail(emailData);
  }

  /**
   * Verify email configuration
   * @returns {Promise<boolean>} True if configuration is valid
   * @throws {Error} Configuration verification error
   */
  async verifyConfiguration() {
    return await this.transporter.verify();
  }

  /**
   * Escape HTML special characters
   * @private
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Close the email transporter
   * @returns {void}
   */
  close() {
    this.transporter.close();
  }
}

module.exports = EmailService;

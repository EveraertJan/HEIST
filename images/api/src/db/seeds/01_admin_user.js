const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  // Check if admin already exists
  const existingAdmin = await knex('users').where({ email: 'admin@heist.gallery' }).first();

  if (!existingAdmin) {
    // Hash the password 'admin123' with MD5 first (as the frontend does), then bcrypt
    const crypto = require('crypto');
    const md5Password = crypto.createHash('md5').update('admin123').digest('hex');
    const hashedPassword = await bcrypt.hash(md5Password, 10);

    await knex('users').insert({
      uuid: uuidv4(),
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@heist.gallery',
      password: hashedPassword,
      is_admin: true,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now()
    });

    console.log('Admin user created: admin@heist.gallery / admin123');
  }
};

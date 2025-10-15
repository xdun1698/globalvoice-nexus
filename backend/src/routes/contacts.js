const express = require('express');
const router = express.Router();
const { getDatabase } = require('../config/database');
const logger = require('../utils/logger');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const os = require('os');
const path = require('path');

// Use system temp directory for uploads in production
const uploadDir = process.env.NODE_ENV === 'production' 
  ? path.join(os.tmpdir(), 'uploads')
  : 'uploads/';

// Ensure upload directory exists
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (error) {
  logger.warn('Could not create upload directory:', error.message);
}

const upload = multer({ 
  dest: uploadDir,
  storage: multer.memoryStorage() // Use memory storage as fallback
});

// Get all contacts
router.get('/', async (req, res) => {
  try {
    const db = getDatabase();
    const { page = 1, limit = 50, search } = req.query;
    const offset = (page - 1) * limit;

    let query = db('contacts').where('user_id', req.user.id);

    if (search) {
      query = query.where(function() {
        this.where('name', 'ilike', `%${search}%`)
          .orWhere('phone', 'ilike', `%${search}%`)
          .orWhere('email', 'ilike', `%${search}%`);
      });
    }

    const contacts = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db('contacts')
      .where('user_id', req.user.id)
      .count('* as count');

    res.json({
      contacts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(count),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    logger.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Create contact
router.post('/', async (req, res) => {
  try {
    const db = getDatabase();
    const { name, phone, email, company, notes, tags } = req.body;

    const [contact] = await db('contacts').insert({
      user_id: req.user.id,
      name,
      phone,
      email,
      company,
      notes,
      tags: JSON.stringify(tags || []),
      created_at: new Date()
    }).returning('*');

    res.status(201).json({ contact });
  } catch (error) {
    logger.error('Error creating contact:', error);
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

// Bulk upload contacts
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const db = getDatabase();
    const contacts = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        contacts.push({
          user_id: req.user.id,
          name: row.name || row.Name,
          phone: row.phone || row.Phone,
          email: row.email || row.Email,
          company: row.company || row.Company,
          created_at: new Date()
        });
      })
      .on('end', async () => {
        await db('contacts').insert(contacts);
        fs.unlinkSync(req.file.path);
        res.json({ message: `${contacts.length} contacts uploaded successfully` });
      });
  } catch (error) {
    logger.error('Error uploading contacts:', error);
    res.status(500).json({ error: 'Failed to upload contacts' });
  }
});

module.exports = router;

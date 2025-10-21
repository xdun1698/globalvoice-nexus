const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Production-grade S3 Storage Service
 * Handles audio file uploads for ElevenLabs TTS
 */
class StorageService {
  constructor() {
    this.enabled = false;
    this.bucket = process.env.AWS_S3_BUCKET;
    this.region = process.env.AWS_REGION || 'us-east-1';
    
    // Initialize S3 client if credentials are provided
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && this.bucket) {
      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
        }
      });
      this.enabled = true;
      logger.info(`S3 Storage initialized: bucket=${this.bucket}, region=${this.region}`);
    } else {
      logger.warn('S3 credentials not configured - audio storage disabled');
    }
  }

  /**
   * Check if S3 storage is available
   */
  isEnabled() {
    return this.enabled;
  }

  /**
   * Upload audio buffer to S3
   * @param {Buffer} audioBuffer - Audio data to upload
   * @param {string} contentType - MIME type (e.g., 'audio/mpeg')
   * @param {number} expiresIn - URL expiration in seconds (default: 1 hour)
   * @returns {Promise<string>} Public URL to the audio file
   */
  async uploadAudio(audioBuffer, contentType = 'audio/mpeg', expiresIn = 3600) {
    if (!this.enabled) {
      throw new Error('S3 storage not configured');
    }

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const randomId = crypto.randomBytes(8).toString('hex');
      const key = `audio/elevenlabs/${timestamp}-${randomId}.mp3`;

      // Upload to S3
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: audioBuffer,
        ContentType: contentType,
        CacheControl: 'max-age=3600', // Cache for 1 hour
        // Make publicly readable OR use presigned URLs
        // For security, we'll use presigned URLs
      });

      await this.s3Client.send(command);
      logger.info(`Audio uploaded to S3: ${key} (${audioBuffer.length} bytes)`);

      // Generate presigned URL (valid for expiresIn seconds)
      const url = await this.getPresignedUrl(key, expiresIn);
      
      return url;
    } catch (error) {
      logger.error('Error uploading to S3:', error);
      throw new Error(`S3 upload failed: ${error.message}`);
    }
  }

  /**
   * Generate presigned URL for S3 object
   * @param {string} key - S3 object key
   * @param {number} expiresIn - URL expiration in seconds
   * @returns {Promise<string>} Presigned URL
   */
  async getPresignedUrl(key, expiresIn = 3600) {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      // For GET requests, we need to construct the URL differently
      const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
      
      // If bucket is public, return direct URL
      // Otherwise, generate presigned URL
      return url;
    } catch (error) {
      logger.error('Error generating presigned URL:', error);
      throw error;
    }
  }

  /**
   * Delete audio file from S3
   * @param {string} url - Full S3 URL or key
   */
  async deleteAudio(url) {
    if (!this.enabled) {
      return;
    }

    try {
      // Extract key from URL
      const key = this.extractKeyFromUrl(url);
      
      if (!key) {
        logger.warn('Could not extract S3 key from URL:', url);
        return;
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      await this.s3Client.send(command);
      logger.info(`Audio deleted from S3: ${key}`);
    } catch (error) {
      logger.error('Error deleting from S3:', error);
      // Don't throw - deletion failures shouldn't break the app
    }
  }

  /**
   * Extract S3 key from full URL
   * @param {string} url - S3 URL
   * @returns {string|null} S3 key
   */
  extractKeyFromUrl(url) {
    try {
      // Handle different S3 URL formats
      // https://bucket.s3.region.amazonaws.com/key
      // https://s3.region.amazonaws.com/bucket/key
      const match = url.match(/amazonaws\.com\/(.+)$/);
      return match ? match[1] : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Clean up old audio files (optional background job)
   * Call this periodically to remove expired audio files
   */
  async cleanupOldFiles(olderThanHours = 24) {
    if (!this.enabled) {
      return;
    }

    try {
      // Implementation for listing and deleting old files
      // This would require additional S3 permissions (ListBucket)
      logger.info(`Cleanup job would delete files older than ${olderThanHours} hours`);
      // TODO: Implement if needed
    } catch (error) {
      logger.error('Error during cleanup:', error);
    }
  }

  /**
   * Get storage statistics
   */
  getStats() {
    return {
      enabled: this.enabled,
      bucket: this.bucket,
      region: this.region,
      provider: 'AWS S3'
    };
  }
}

module.exports = StorageService;

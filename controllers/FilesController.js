/* creates a new file in DB and disk
 * retrieves a user based on token
 * creates a new file
    * specify name, type, parentId(optional), isPublic(optional), data
 * user ID must be stored as owner in DB
 */

import { v4 as uuidv4 } from 'uuid';
import { ObjectId } from 'mongodb';
import { promises as fs } from 'fs';
import redis from '../utils/redis';
import db from '../utils/db';

class FilesController {
  static async postUpload(req, res) {
    try {
      const token = req.headers['x-token'];

      // Authenticate the user based on the token
      const keyID = await redis.get(`auth_${token}`);
      if (!keyID) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await db.db.collection('users').findOne({ _id: ObjectId(keyID) });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Validate input parameters
      const {
        name, type, isPublic = false, parentId = 0, data,
      } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Missing name' });
      }

      if (!type || !['folder', 'file', 'image'].includes(type)) {
        return res.status(400).json({ error: 'Missing type' });
      }

      if (!data && type !== 'folder') {
        return res.status(400).json({ error: 'Missing data' });
      }

      // If parentId is set, validate it
      if (parentId !== 0) {
        const parentFile = await db.db.collection('files').findOne({ _id: ObjectId(parentId) });
        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }

        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      // Prepare file attributes
      const fileAttrs = {
        userId: user._id, name, type, isPublic, parentId,
      };

      // If type is folder, add the file to the DB and return the new file
      if (type === 'folder') {
        const result = await db.db.collection('files').insertOne(fileAttrs);
        return res.status(201).json({ ...fileAttrs, id: result.insertedId });
      }

      // If type is file or image, store the file locally and add to the DB
      const tmpdir = process.env.FOLDER_PATH || '/tmp/files_manager';
      await fs.mkdir(tmpdir, { recursive: true });

      const uuid = uuidv4();
      const localPath = `${tmpdir}/${uuid}`;
      const buff = Buffer.from(data, 'base64');

      await fs.writeFile(localPath, buff);

      fileAttrs.localPath = localPath;
      const result = await db.db.collection('files').insertOne(fileAttrs);

      // Return the new file
      return res.status(201).json({ ...fileAttrs, id: result.insertedId });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getShow(req, res) {
    try {
      // extract token from request headers
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // retrieve user ID from Redis cache
      const keyID = await redis.get(`auth_${token}`);
      if (!keyID) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // find authenticated user based on user ID
      const user = await db.db.collection('users').findOne({ _id: ObjectId(keyID) });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // find the file based on the ID and user ID
      const file = await db.db.collection('files').findOne({
        _id: ObjectId(req.params.id),
        userId: user._id,
      });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      return res.status(200).json(file);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getIndex(req, res) {
    try {
      // Extract token from request headers
      const token = req.headers['x-token'];
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Retrieve user ID from Redis cache using the token
      const keyID = await redis.get(`auth_${token}`);
      if (!keyID) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Find the authenticated user based on the user ID
      const user = await db.db.collection('users').findOne({ _id: ObjectId(keyID) });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Extract parentId and page from query parameters with defaults
      const parentId = req.query.parentId || 0;
      const page = parseInt(req.query.page, 10) || 0;
      const perPage = 20;
      const skip = page * perPage;

      // Use MongoDB aggregation to retrieve paginated file documents
      const files = await db.db.collection('files').aggregate([
        { $match: { userId: user._id, parentId: ObjectId(parentId) } },
        { $skip: skip },
        { $limit: perPage },
      ]).toArray();

      // Return the list of file documents
      return res.status(200).json(files);
    } catch (error) {
      // Handle unexpected errors and return a 500 Internal Server Error
      return res.status(500).json({ error: error.message });
    }
  }
}

export default FilesController;

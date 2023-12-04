/* contains the following endpoints:
 * - GET /connect that signs in a user by generating a new authentication token
 * - GET /disconnect that signs out a user based on the token previously generated
 */

import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  static async getConnect(req, res) {
    try {
      // Extract email and password from Authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const [email, password] = credentials.split(':');

      // Check if user exists in DB
      const user = await dbClient.db.collection('users').findOne({
        email,
        password: sha1(password),
      });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate a random token using uuidv4
      const token = uuidv4();

      // Store user ID in Redis with the generated token as the key
      await redisClient.set(`auth_${token}`, user._id.toString(), 24 * 60 * 60);

      return res.status(200).json({ token });
    } catch (error) {
      console.error(`Error in getConnect: ${error}`);
      res.status(500).json({ error: 'Internal Server Error' });
    }
    return res.status(200).end();
  }

  static async getDisconnect(req, res) {
    try {
      // Extract token from X-Token header
      const token = req.headers['x-token'];

      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Delete the token in Redis
      await redisClient.del(`auth_${token}`);

      return res.status(204).end();
    } catch (error) {
      console.error(`Error in getDisconnect: ${error}`);
      res.status(500).json({ error: 'Internal Server Error' });
    }
    return res.status(204).end();
  }
}

export default AuthController;

/* contains the definition of the 2 endpoints: GET /status and GET /stats
 * GET /status should return if Redis and DB are alive and with a 200 status code
 * GET /stats should return the number of users and files in DB and a 200 status code
*/

import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static async getStatus(req, res) {
    const redisIsAlive = redisClient.isAlive();
    const dbIsAlive = dbClient.isAlive();

    const status = {
      redis: redisIsAlive,
      db: dbIsAlive,
    };

    const statusCode = redisIsAlive && dbIsAlive ? 200 : 500;

    res.status(statusCode).json(status);
  }

  static async getStats(req, res) {
    try {
      const usersCount = await dbClient.nbUsers();
      const filesCount = await dbClient.nbFiles();

      const stats = {
        users: usersCount,
        files: filesCount,
      };

      res.status(200).json(stats);
    } catch (error) {
      console.error(`Error in getStats: ${error}`);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default AppController;

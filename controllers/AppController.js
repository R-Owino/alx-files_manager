/* contains the definition of the 2 endpoints: GET /status and GET /stats
 * GET /status should return if Redis and DB are alive and with a 200 status code
 * GET /stats should return the number of users and files in DB and a 200 status code
*/

const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AppController {
  static getStatus(req, res) {
    const redis = redisClient.isAlive();
    const db = dbClient.isAlive();
    res.status(200).send({ redis, db });
  }

  static async getStats(req, res) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();
    res.status(200).send({ users, files });
  }
}

module.exports = AppController;

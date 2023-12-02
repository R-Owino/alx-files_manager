/* contains class RedisClient that has:
 * - constructor that creates a client to Redis
 * - function isAlive that returns True if connection to Redis is a success
 * - async function get that returns the value of a key
 * - async function set that sets a key to a value
 * - async function del that deletes a given value of a key in Redis
 */

import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.client.on('error', (err) => console.log(`Redis client not connected to the server: ${err.message}`));
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    const getAsync = promisify(this.client.get).bind(this.client);
    const value = await getAsync(key);
    return value;
  }

  async set(key, value, duration) {
    this.client.setex(key, duration, value);
  }

  async del(key) {
    this.client.del(key);
  }
}

// create and export an instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;

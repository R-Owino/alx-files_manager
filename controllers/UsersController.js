/* contains the definition of POST /users which creates a user in DB
 * specifies an email and password
    * password is stored in DB as a SHA1 hash
 * returns a 201 status code and the newly created user with only email and id
 * new user must be saved in users collection
*/

import sha1 from 'sha1';
import db from '../utils/db';
import redis from '../utils/redis';

class UsersController {
  static async postNew(req, res) {
    try {
    // check if email and password are present in the body
      const { email, password } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }
      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }

      // check if user exists in DB
      const emailExists = await db.users.find({ email }).count();
      if (emailExists > 0) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // insert a new user
      const hashedPassword = sha1(password);
      const user = await db.users.insertOne({ email, password: hashedPassword });
      res.status(201);
      return res.json({ email, id: user.insertedId });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const key = `auth_${token}`;
    const ID = await redis.get(key);
    if (!ID) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userArray = await db.users.find(`ObjectId("${ID}")`).toArray();
    const user = userArray[0];
    return res.json({ id: user._id, email: user.email });
  }
}

export default UsersController;

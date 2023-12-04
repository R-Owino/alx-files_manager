/* contains the definition of POST /users which creates a user in DB
 * specifies an email and password
    * password is stored in DB as a SHA1 hash
 * returns a 201 status code and the newly created user with only email and id
 * new user must be saved in users collection
*/

import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const { ObjectId } = require('mongodb');

export default class UsersController {
  static async postNew(req, res) {
    const userEmail = req.body.email;
    const userPassword = req.body.password;
    try {
      if (!userEmail) {
        return res.status(400).send({ error: 'Missing email' });
      }
      if (!userPassword) {
        return res.status(400).send({ error: 'Missing password' });
      }

      const checkExistingUserByEmail = await dbClient.db.collection('users').findOne({ email: userEmail });
      if (checkExistingUserByEmail) {
        return res.status(400).send({ error: 'Already exist' });
      }

      const hashedPassword = sha1(userPassword);
      const newUser = { email: userEmail, password: hashedPassword };

      try {
        await dbClient.db.collection('users').insertOne(newUser, () => {
          const userId = newUser._id;
          return res.status(201).send({ id: userId, email: userEmail });
        });
      } catch (error) {
        return res.status(error.status).send({ error });
      }
    } catch (error) {
      return res.status(500).send({ error: 'Server error' });
    }
    return res.status(201).send();
  }

  static async getMe(req, res) {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const redisToken = await redisClient.get(`auth_${token}`);
    if (!redisToken) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(redisToken) });
    if (!user) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    delete user.password;
    return res.status(200).send({ id: user._id, email: user.email });
  }
}

/* contains the definition of POST /users which creates a user in DB
 * specifies an email and password
    * password is stored in DB as a SHA1 hash
 * returns a 201 status code and the newly created user with only email and id
 * new user must be saved in users collection
*/

import sha1 from 'sha1';
import dbClient from '../utils/db';
import RedisClient from '../utils/redis';

class UsersController {
  static async postNew(req, res) {
    // get email and password from request body
    const { email, password } = req.body;

    // check if email and password are present
    if (!email) return res.status(400).send({ error: 'Missing email' });
    if (!password) return res.status(400).send({ error: 'Missing password' });

    // check if email already exists
    const emailExists = await dbClient.getUser({ email });
    if (emailExists) return res.status(400).send({ error: 'Already exist' });

    // hash password and create user in DB
    const hashedPassword = sha1(password);
    const user = await dbClient.createUser({ email, password: hashedPassword });
    const key = RedisClient.key(`user:${user.id}`);
    await RedisClient.set(key, user.email, 86400);
    return res.status(201).send({ id: user.id, email: user.email });
  }

  static async getMe(req, res) {
    // get token from request header
    const token = req.header('X-Token');

    // check if token is present
    const key = RedisClient.key(`auth_${token}`);

    // check if token is valid
    const userId = await RedisClient.get(key);

    // check if user exists
    const user = await dbClient.getUser({ id: userId });

    // return user info
    if (!user) return res.status(401).send({ error: 'Unauthorized' });
    return res.status(200).send({ id: user.id, email: user.email });
  }
}

export default UsersController;

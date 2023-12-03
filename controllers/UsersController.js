/* contains the definition of POST /users which creates a user in DB */

import sha1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) return res.status(400).send({ error: 'Missing email' });
    if (!password) return res.status(400).send({ error: 'Missing password' });
    const userExist = await dbClient.userExists(email);
    if (userExist) return res.status(400).send({ error: 'Already exist' });
    const user = await dbClient.createUser(email, sha1(password));
    return res.status(201).send(user);
  }
}

export default UsersController;

/* contains the definition of POST /users which creates a user in DB */

import sha1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) return res.status(400).send({ error: 'Missing email' });
    if (!password) return res.status(400).send({ error: 'Missing password' });
    const userExists = await dbClient.usersCollection.findOne({ email });
    if (userExists) return res.status(400).send({ error: 'Already exist' });
    const hashedPassword = sha1(password);
    const user = await dbClient.usersCollection.insertOne({ email, password: hashedPassword });
    return res.status(201).send({ id: user.insertedId, email });
  }
}

export default UsersController;

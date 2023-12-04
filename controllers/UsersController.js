/* contains the definition of POST /users which creates a user in DB */

import crypto from 'crypto';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    // get email and password from the body
    const { email, password } = req.body;

    // check if email or password are missing
    if (!email) return res.status(400).json({ error: 'Missing email' });
    if (!password) return res.status(400).json({ error: 'Missing password' });

    // check if email already exists
    const users = await dbClient.db.collection('users');
    const foundUser = await users.find({ email }).toArray();
    if (foundUser.length > 0) return res.status(400).json({ error: 'Already exist' });

    // hash the password
    const hashedPass = crypto.createHash('SHA1').update(password).digest('hex');

    // insert the user in DB
    const userCreationObj = await users.insertOne({ email, password: hashedPass });
    const newUser = { id: userCreationObj.insertedId, email };
    return res.status(201).json(newUser);
  }

  static async getMe(req, res) {
    // get the token from the header
    const token = req.headers['x-token'];

    // check if token is missing
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    // get the user ID from Redis
    const userId = await dbClient.get(`auth_${token}`);

    // check if user ID exists
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // get the user from DB
    const users = await dbClient.db.collection('users');
    const foundUser = await users.findOne({ _id: ObjectId(userId) });

    // check if user exists
    if (!foundUser) return res.status(401).json({ error: 'Unauthorized' });

    // return the user object
    return res.status(200).json({ id: foundUser._id, email: foundUser.email });
  }
}

export default UsersController;

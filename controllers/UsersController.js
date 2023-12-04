/* contains the definition of POST /users which creates a user in DB */

import sha1 from 'sha1';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    try {
      // Extract email and password from request body
      const { email, password } = req.body;

      // Check if email and password are provided
      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }

      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }

      // Check if email already exists in DB
      const userExists = await dbClient.db.collection('users').findOne({ email });

      if (userExists) {
        return res.status(400).json({ error: 'Already exists' });
      }

      // Hash the password using SHA1
      const hashedPassword = sha1(password);

      // Create a new user object
      const newUser = {
        email,
        password: hashedPassword,
      };

      // Insert the new user into the 'users' collection
      const result = await dbClient.db.collection('users').insertOne(newUser);

      // Return the new user with only email and id
      const insertedUser = {
        email: result.ops[0].email,
        id: result.ops[0]._id,
      };

      res.status(201).json(insertedUser);
    } catch (error) {
      console.error(`Error in postNew: ${error}`);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UsersController;

/* contains a class DBClient that has:
 * - constructor that creates a client to MongoDB
 * - function isAlive that returns True if connection to MongoDB is a success
 * - async function nbUsers that returns the number of documents in the collection users
 * - async function nbFiles that returns the number of documents in the collection files
 */

import { MongoClient } from 'mongodb';

// constructor that creates a client to MongoDB
class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;
    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.client.connect((err) => {
      if (err) console.log(err);
      else console.log(`Connected to DB ${database}`);
    });
    this.db = this.client.db(database);
  }

  // function isAlive that returns True if connection to MongoDB is a success
  isAlive() {
    return this.client.isConnected();
  }

  // async function nbUsers that returns the number of documents in the collection users
  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  // async function nbFiles that returns the number of documents in the collection files
  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }
}

// create and export an instance of DBClient
const dbClient = new DBClient();
module.exports = dbClient;

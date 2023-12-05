/* contains a class DBClient that has:
 * - constructor that creates a client to MongoDB
 * - function isAlive that returns True if connection to MongoDB is a success
 * - async function nbUsers that returns the number of documents in the collection users
 * - async function nbFiles that returns the number of documents in the collection files
 */

import { MongoClient } from 'mongodb';

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 27017;
const db = process.env.DB_DATABASE || 'files_manager';

// constructor that creates a client to mongodb
class DBClient {
  constructor() {
    this.conn = false;
    MongoClient.connect(
      `mongodb://${host}:${port}/${db}`,
      { useNewUrlParser: true, useUnifiedTopology: true },
      (err, client) => {
        if (!err) {
          this.db = client.db(db);
          this.files = this.db.collection('files');
          this.users = this.db.collection('users');
          this.conn = true;
        } else {
          console.log(err);
        }
      },
    );
  }

  // function isAlive that returns True if connection to MongoDB is a success
  isAlive() {
    return this.conn;
  }

  // async function nbUsers that returns the number of documents in the collection users
  async nbUsers() {
    return this.users.countDocuments();
  }

  // async function nbFiles that returns the number of documents in the collection files
  async nbFiles() {
    return this.files.countDocuments();
  }
}

// create and export an instance of DBClient
const dbClient = new DBClient();
module.exports = dbClient;

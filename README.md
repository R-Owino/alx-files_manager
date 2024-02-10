## Files manager
- Wrap-up of the backend trimester:
    - Authentication
    - NodeJS
    - MongoDB
    - Redis
    - Pagination
    - Background processing
- The objective is to build a simple platform to upload and view files:
    - User authentication via a token
    - List all files
    - Upload a new file
    - Change permission of a file
    - View a file
    - Generate thumbnails for images
- **Note**: Of course such kinds of services already exist in real life, a popular one being File Explorer by Microsoft. This is just for learning, to experience how different parts of such a service are assembled.

The learning objectives of this project are:
- how to create an API with Express
- how to authenticate a user
- how to store data in MongoDB
- how to store temporary data in Redis
- how to setup and use a background worker

### Resources
- [Node JS getting started](https://nodejs.org/en/docs/guides/getting-started-guide)
- [Process API doc](https://node.readthedocs.io/en/latest/api/process/)
- [Express getting started](https://expressjs.com/en/starter/installing.html)
- [Mocha documentation](https://mochajs.org/)
- [Nodemon documentation](https://github.com/remy/nodemon#nodemon)
- [MongoDB](https://github.com/mongodb/node-mongodb-native)
- [Bull](https://github.com/Optim)
- [Image thumbnail](https://www.npmjs.com/package/image-thumbnail)
- [Mime-Types](https://www.npmjs.com/package/mime-types)
- [Redis](https://github.com/redis/node-redis)

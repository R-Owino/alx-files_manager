/* contains an express server
    * that listens on env port or default 5000
    * that loads all routes from routes/index.js
*/

import express from 'express';
import router from './routes/index';

const app = express();
const port = process.env.PORT || 5000;

// use the router object to manage all routes
app.use('/', router);
app.use(express.json());

// listen on port
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;

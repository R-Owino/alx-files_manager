/* contains an express server
    * that listens on env port or default 5000
    * that loads all routes from routes/index.js
*/

// require express
const express = require('express');

const app = express();
const port = process.env.PORT || 5000;

// require routes
const routes = require('./routes');

// use routes
app.use('/', routes);

// listen on port
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

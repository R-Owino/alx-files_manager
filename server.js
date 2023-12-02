/* contains an express server
    * that listens on env port or default 5000
    * that loads all routes from routes/index.js
*/

// require express
const express = require('express');

const app = express();
const port = process.env.PORT || 5000;

// require routes
const routes = require('./routes/index');

// use routes
app.use('/', routes);
app.use(express.json());

// listen on port
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;

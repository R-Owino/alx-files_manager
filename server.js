/* contains an express server
    * that listens on env port or default 5000
    * that loads all routes from routes/index.js
*/

import express from 'express';
import routes from './routes';

const app = express();
const PORT = process.env.PORT || 5000;

app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;

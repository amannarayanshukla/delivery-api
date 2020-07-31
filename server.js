require('dotenv').config({ path: './config/.env' });

const express = require('express');

const app = express();
const port = process.env.PORT;

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`App listening on http://localhost:${port}`));

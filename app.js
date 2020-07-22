const express = require('express');
require('express-async-errors');
const cors = require('cors');

const tournamentsRouter = require('./controllers/tournaments');
const middleware = require('./utils/middleware');

const app = express();

app.use(cors());
app.use(express.static('build'));
app.use(express.json());

// Add controllers
app.use('/api/tournaments', tournamentsRouter);

app.use(middleware.errorHandler);

module.exports = app;
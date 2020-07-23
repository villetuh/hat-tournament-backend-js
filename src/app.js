const express = require('express');
require('express-async-errors');
const cors = require('cors');
const mongoose = require('mongoose');

const loginRouter = require('./controllers/login');
const tournamentsRouter = require('./controllers/tournaments');
const usersRouter = require('./controllers/users');

const config = require('./utils/config');
const middleware = require('./utils/middleware');

const app = express();

mongoose.connect(config.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

app.use(cors());
app.use(express.static('build'));
app.use(express.json());

// Controllers
app.use('/api/login', loginRouter);
app.use('/api/tournaments', tournamentsRouter);
app.use('/api/users', usersRouter);

app.use(middleware.errorHandler);

module.exports = app;

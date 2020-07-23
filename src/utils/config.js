require('dotenv').config();

let DB_URI = process.env.NODE_ENV === 'test'
  ? process.env.DB_TEST_CONNECTION_STRING
  : process.env.DB_CONNECTION_STRING;

let PORT = process.env.PORT;

module.exports = {
  DB_URI,
  PORT
};

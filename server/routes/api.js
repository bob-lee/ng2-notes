const  routes = require('express').Router();
const notes = require('./notes/notes');

routes.use('/notes', notes);

routes.get('/', (req, res) => {
  res.status(200).json({message: 'Connected!'});
});

module.exports = routes;
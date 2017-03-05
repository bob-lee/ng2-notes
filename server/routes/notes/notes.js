const notes = require('express').Router();
const Note = require('../../models/note');

notes
  .post('/', (req, res) => {
    console.log('post', req.body);
    let note = new Note();
    note.group = req.body.group;
    note.name = req.body.name;
    note.text = req.body.text;

    note.save((err) => {
      if (err)
        res.send(err);

      res.json({ message: 'Note created!', note: note }); // return saved note
    });
  })
  .get('/:group_id', (req, res) => { // GET api/notes/myGroupName
    console.log('single', req.body);
    const id = req.params.group_id;
    Note.find({ group: req.params.group_id }, (err, notes) => {
      if (err)
        res.send(err);

      res.status(200).json(notes);
    });
  })
  .put('/:note_id', (req, res) => {
    console.log('put', req.body);
    Note.findById(req.params.note_id, (err, note) => {
      if (err)
        res.send(err);

      // update the notes info
      note.name = req.body.name;
      note.text = req.body.text;

      note.save((err) => {
        if (err)
          res.send(err);

        res.json({ message: 'Note updated!', note: note }); // return saved note
      });
    });
  })
  .delete('/:note_id', (req, res) => {
    Note.remove({ _id: req.params.note_id }, (err, note) => {
      if (err)
        res.send(err);
      
      res.json({ message: 'Successfully deleted' });
    });
  });

module.exports = notes;
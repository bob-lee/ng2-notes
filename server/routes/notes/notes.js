const notes = require('express').Router();
const Note = require('../../models/note');

const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

notes
  .get('/:group_id', (req, res) => { // GET api/notes/myGroupName
    console.log('single', req.body);
    const id = req.params.group_id;
    Note.find({ group: req.params.group_id }, (err, notes) => {
      if (err) throw err;

      notes.forEach(note => { // convert binary data to data uri string
        setDataUri(note);
      });

      res.status(200).json(notes);
    });
  })
  .post('/', (req, res) => {
    const body = req.body,
      base64 = body.base64;
    console.log(`post { name: ${body.name}, text: ${body.text}, base64: ${body.base64 && body.base64.length}, imgTo:${body.imgTo} }`);

    let note = new Note();
    note.group = body.group;
    note.name = body.name;
    note.text = body.text;
    note.isBase64 = body.isBase64; // once saved, not-editable
    note.base64 = body.base64;

    note.save(function (err) {
      if (err) {
        console.error(note);
        res.send(err);
      }

      res.json(note);
    });
  })
  .post('/form', upload.single('optional'), (req, res) => {
    const file = req.file,
      body = req.body;
    console.log(`post file: ${file}, body: { name: ${body.name}, text: ${body.text}, base64: ${body.base64 && body.base64.length}, imgTo:${body.imgTo} }`);

    let note = new Note();
    note.group = body.group;
    note.name = body.name;
    note.text = body.text;
    note.isBase64 = body.isBase64; // once saved, not-editable
    if (req.file) {
      note.img.data = fs.readFileSync(req.file.path);
      note.img.contentType = req.file.mimetype;
    }

    note.save(function (err) {
      if (err) throw err;

      setDataUri(note, file); // to show saved image
      res.json(note);
    });
  })
  .put('/:note_id', (req, res) => {
    const body = req.body,
      base64 = body.base64;
    console.log(`put { name: ${body.name}, text: ${body.text}, base64: ${body.base64 && body.base64.length}, imgTo:${body.imgTo} }`);

    Note.findById(req.params.note_id, (err, note) => {
      if (err) res.send(err);

      // update the notes info
      note.name = body.name;
      note.text = body.text;
      if (body.imgTo === 'remove') {
        note.base64 = '';
      } else if (body.base64) {
        note.base64 = body.base64;
      }

      note.save((err) => {
        if (err) res.send(err);

        res.json(note);
      });
    });
  })
  .put('/form/:note_id', upload.single('optional'), (req, res) => {
    const file = req.file,
      body = req.body;
    console.log(`put file: ${file}, body: { name: ${body.name}, text: ${body.text}, base64: ${body.base64 && body.base64.length}, imgTo:${body.imgTo} }`);

    Note.findById(req.params.note_id, (err, note) => {
      if (err) res.send(err);

      // update the notes info
      note.name = body.name;
      note.text = body.text;
      if (file) {
        note.img.data = fs.readFileSync(file.path);
        note.img.contentType = file.mimetype;
      } else if (body.imgTo === 'remove') { // to remove existing saved image on database
        console.log('put file: delting img');
        note.img = undefined;
      }

      note.save((err) => {
        if (err) res.send(err);

        setDataUri(note, file); // to show saved image
        res.json(note);
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

function setDataUri(note, file) { // assumes file saved ok, remove file and set data uri for client view
  if (file) {
    fs.unlink(file.path, (err) => {
      if (err) return console.log(err);
      console.log(`file deleted successfully '${file.path}'`);
    })
  }

  if (note.img && note.img.data) {
    const base64 = note.img.data.toString('base64');
    const dataUri = `data:${note.img.contentType};base64,${base64}`;
    console.log(note._id, note.img.data.length, base64.length); // 68744 bytes -> 91660 bytes, 33% size increase
    note.img = undefined;
    note.base64 = dataUri;
  }
}
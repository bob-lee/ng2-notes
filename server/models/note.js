const mongoose = require('mongoose');
mongoose.connect('mongodb://40.115.76.186:27017/notes'); // to be on cloud

const Schema = mongoose.Schema;

const NoteSchema = new Schema({
    group: String,
    name: String,
    text: String,
    isBase64: Boolean,
    base64: String, // to store data as base64 string, encoding to be done by client, to expect 33% size increase compare to binary
    img: { data: Buffer, contentType: String }, // to store data as binary, client to upload via FormData
    imgTo: String // client to set what to do with any existing data on db, '': do nothing or save uploaded image, 'remove': to remove image on db
}, { timestamps: true });

module.exports = mongoose.model('Note', NoteSchema);

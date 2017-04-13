const mongoose = require('mongoose');
mongoose.connect('mongodb://40.115.76.186:27017/notes'); // to be on cloud

const Schema = mongoose.Schema;

const NoteSchema = new Schema({
    group: String,
    name: String,
    text: String,
    img: { data: Buffer, contentType: String }, // to store optional image
    dataUri: String // to download data uri for img tag
}, { timestamps: true });

module.exports = mongoose.model('Note', NoteSchema);

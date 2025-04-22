const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  archived: {
    type: Boolean,
    default: false,
  },
});

NoteSchema.methods.isActive = function () {
  // If note is archived, it's not active
  return !this.archived;
};

module.exports = mongoose.model('Note', NoteSchema);
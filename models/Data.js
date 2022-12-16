const mongoose = require('mongoose');

const DataSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    likes: { type: Array },
    comments: { type: Array },
    date: { type: Date, default: Date.now },
    img: { type: Object, required: true }
})

module.exports = mongoose.model('datas', DataSchema);
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({ //using 'Schema' because i've abbreviated it from mongoose.Schema in line 2
    body:{
        type: String,
        required: true
    },
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Review', reviewSchema);
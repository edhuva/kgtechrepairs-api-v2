const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence-generator')(mongoose);

const imageSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        location: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

imageSchema.plugin(AutoIncrement, {
    inc_field: 'imageNo',
    id: 'imageNums',
    start_seq: 1
})

module.exports = mongoose.model('Image', imageSchema)
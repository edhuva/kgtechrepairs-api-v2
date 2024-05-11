const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence-generator')(mongoose);

const ContactSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        status: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

ContactSchema.plugin(AutoIncrement, {
    inc_field: 'ContactNo',
    id: 'ContactNums',
    start_seq: 1
})

module.exports = mongoose.model('Contact', ContactSchema)
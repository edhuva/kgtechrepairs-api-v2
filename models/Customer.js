const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence-generator')(mongoose);

const customerSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        fullname: {
            type: String,
            required: true
        },
        phoneNo: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true
    }
)

customerSchema.plugin(AutoIncrement, {
    inc_field: 'customerNo',
    id: 'customerNums',
    start_seq: 1
})

module.exports = mongoose.model('Customer', customerSchema)
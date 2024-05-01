const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence-generator')(mongoose);

const employeeSchema = new mongoose.Schema(
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
        experties: {
            type: [String],
            default: ['Hardware']
        }
    },
    {
        timestamps: true
    }
)

employeeSchema.plugin(AutoIncrement, {
    inc_field: 'employeeNo',
    id: 'employeeNums',
    statrt_seq: 1
})

module.exports = mongoose.model('Employee', employeeSchema)
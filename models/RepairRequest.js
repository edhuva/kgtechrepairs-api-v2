const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence-generator')(mongoose);

const repairRequestSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Customer'
        },
        deviceType: {
            type: String,
            required: true
        },
        serialNo: {
            type: String,
            required: true
        },
        brand: {
            type: String,
            required: true
        },
        issueDesc: {
            type: String,
            required: true
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

repairRequestSchema.plugin(AutoIncrement, {
    inc_field: 'requestNo',
    id: 'requestNums',
    start_seq: 1
})

module.exports = mongoose.model('RepairRequest', repairRequestSchema)
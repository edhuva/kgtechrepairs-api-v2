const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence-generator')(mongoose);

const repairOrderSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Customer'
        },
        employeeCreated: {
            type: String,
            required: true
        },
        employeeAssigned: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Employee'
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
        completed: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

repairOrderSchema.plugin(AutoIncrement, {
    inc_field: 'repairTicket',
    id: 'repairNums',
    start_seq: 100
})

module.exports = mongoose.model('RepairOrder', repairOrderSchema)
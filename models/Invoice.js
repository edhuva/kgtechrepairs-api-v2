const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence-generator')(mongoose);

const invoiceSchema = new mongoose.Schema(
    {
        repairOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'RepairNote'
        },
        customer: {
            type: String,
            required: true
        },
        employee: {
            type: String,
            required: true,
        },
        deviceType: {
            type: String,
            required: true
        },
        serialNo: {
            type: String,
            required: true
        },
        totalAmount: {
            type: Number,
            required: true
        },
        paid: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)

invoiceSchema.plugin(AutoIncrement, {
    inc_field: 'invoiceNo',
    id: 'invoiceNums',
    start_seq: 100
})

module.exports = mongoose.model('Invoce', invoiceSchema)
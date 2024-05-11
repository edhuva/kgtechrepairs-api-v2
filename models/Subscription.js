const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence-generator')(mongoose);

const subscriptionSchema = new mongoose.Schema(
    {
        email: {
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

subscriptionSchema.plugin(AutoIncrement, {
    inc_field: 'SubscriptionNo',
    id: 'SubcribNums',
    start_seq: 1
})

module.exports = mongoose.model('Subscription', subscriptionSchema)
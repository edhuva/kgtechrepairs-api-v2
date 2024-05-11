const Subscription = require('../models/Subscription');

//@desc         Get all subscriptions
//@route        GET /subscriptions
//@access       Private
const getAllSubscriptions = async (req, res) => {
    // Get all subscriptions from mongoDB
    const subscriptions = await Subscription.find().lean();

    //if no subscriptions
    if (!subscriptions) {
        return res.status(400).json({ message: 'No subscription found' });
    }

    res.json(subscriptions);
}

//@desc         Update subscription
//@route        PATCH subscriptions
//@access       Private
const updateSubscription = async (req, res) => {
    const { id, email, status } = req.body;

    //confirm data
    if (!id || !email || typeof status !== 'boolean') {
        return res.status(400).json({ message: 'All fields are Required'});
    }

    //confirm subscription exist to update
    const subscription = await Subscription.findById(id).exec();

    if (!subscription) {
        return res.status(400).json({ message: 'Subscription not found' });
    }

    //check for duplicate contact
    const duplicate = await Subscription.findOne({ email }).lean().exec();

    if (duplicate && duplicate._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate subscription email' });
    }

    //update subscription
    subscription.email = email;
    subscription.status = status;

    const updatedSubscription = await subscription.save();
    res.json(`'Subscription with ID ${updatedSubscription._id}' updated`);
}

//@desc         Delete subscription
//@route        DELETE /subscriptions
//@access       Private
const deleteSubscription = async (req, res) => {
    const { id } = req.body;

    //confirm data
    if (!id) {
        return res.status(400).json({ message: 'Subscription ID required'});
    }

    //confirm Subscription exists to delete
    const subscription = await Subscription.findById(id).exec();

    if (!subscription) {
        return res.status(400).json({ message: 'Subscription not found' });
    }

    await subscription.deleteOne();
    
    const reply = `Subscription with ID '${ subscription._id }' deleted`;

    res.json(reply);
}

module.exports = {
    getAllSubscriptions,
    updateSubscription,
    deleteSubscription
}
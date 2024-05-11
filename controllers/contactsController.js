const Contact = require('../models/Contact');

//@desc         Get all Contacts
//@route        GET /contacts
//@access       Private
const getAllContacts = async (req, res) => {
    // Get all contacts from mongoDB
    const contacts = await Contact.find().lean();

    res.json(contacts);
}

//@desc         Update contact
//@route        PATCH contacts
//@access       Private
const updateContact = async (req, res) => {
    const { id, email, message, status } = req.body;

    //confirm data
    if (!id || !email || !message || typeof status !== 'boolean') {
        return res.status(400).json({ message: 'All fields are Required'});
    }

    //confirm contact exist to update
    const contact = await Contact.findById(id).exec();

    if (!contact) {
        return res.status(400).json({ message: 'Contact not found' });
    }

    //check for duplicate contact
    const duplicate = await Contact.findOne({ email }).lean().exec();

    if (duplicate && duplicate._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate contact email' });
    }

    //update contact
    contact.email = email;
    contact.message = message;
    contact.status = status;

    const updatedContact = await contact.save();
    res.json(`'Contact with ID ${updatedContact._id}' updated`);
}

//@desc         Delete contact
//@route        DELETE /contacts
//@access       Private
const deleteContact = async (req, res) => {
    const { id } = req.body;

    //confirm data
    if (!id) {
        return res.status(400).json({ message: 'Contact ID required'});
    }

    //confirm Contact exists to delete
    const contact = await Contact.findById(id).exec();

    if (!contact) {
        return res.status(400).json({ message: 'Contact not found' });
    }

    await contact.deleteOne();
    
    const reply = `Contact with ID '${ contact._id }' deleted`;

    res.json(reply);
}

module.exports = {
    getAllContacts,
    updateContact,
    deleteContact
}
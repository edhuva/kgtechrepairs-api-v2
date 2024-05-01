const express = require('express');
const router = express.Router();
const path = require('path');
//root route
router.get('^/$|index(.html)?', (req, res) => {
    return res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
})

module.exports = router
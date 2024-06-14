require('dotenv').config();
require('express-async-errors');
const express = require('express');
const app = express();
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const path = require('path');
const { logger, logEvents } = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const connectDB = require('./config/dbConn');
const PORT = process.env.PORT || 3500;

//connect DB
connectDB()

//custome middleware
app.use(logger)

//third-party middlewares
app.use(cors(corsOptions))

app.use(cookieParser());

// buiit-in midlewares
app.use(express.json());
app.use('/',express.static(path.join(__dirname, 'Public')));

// routes
app.use('/', require('./routes/root'));
app.use('/auth', require('./routes/authRoutes'))
app.use('/users', require('./routes/userRoutes'));
app.use('/employees', require('./routes/employeeRoutes'));
app.use('/customers', require('./routes/customerRoutes'));
app.use('/repairorders', require('./routes/repaireOrderRoutes'));
app.use('/invoices', require('./routes/invoiceRoutes'));
app.use('/repairrequests', require('./routes/repairRequestRoutes'));
app.use('/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/contacts', require('./routes/contactRoutes'));

app.all('*', (req, res) => {
    res.status(404);
    if(req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.json({message: 'data not found'});
    } else {
        res.type('text').send('404 not found');
    }
})

//error Handler
app.use(errorHandler);

//mongoose connection
mongoose.connection.once('open', () => {
    // console.log('Connected to MongoDB');
    // app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));
    app.listen(PORT, () => console.log(`Server is running`));
})

//mongoose connection error
mongoose.connection.on('error', err => {
    // console.log(err);
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log');
})
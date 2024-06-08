const fs = require('fs');
const fsPromise = require('fs').promises;
const path = require('path');
const {v4: uuid} = require('uuid');
const { format } = require('date-fns');

const logEvents = async (message, filename) => {

    const dateTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss');
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

    try {
        if(!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await fsPromise.mkdir(path.join(__dirname, '..', 'logs'));
        }

        await fsPromise.appendFile(path.join(__dirname, '..', 'logs', filename), logItem);
    } catch (err) {
        // console.log(err);
    }
}

const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log');
    console.log(`${req.method}\t${req.path}`);

    next();
}

module.exports = { logger, logEvents}


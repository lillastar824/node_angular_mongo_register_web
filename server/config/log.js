const winston = require('winston');
const Rotate = require('winston-logrotate').Rotate;

var rotateTransport = new Rotate({
        file: __dirname + '/log/debug.log', 
		colorize: false,
		timestamp: true,
		json: false,
		size: '10m',
		keep: 5,
		compress: true
});

var rotateTransportException = new Rotate({
        file: __dirname + '/log/exceptions.log', 
		colorize: false,
		timestamp: true,
		json: false,
		size: '10m',
		keep: 5,
		compress: true
});

var logger =  new (winston.Logger)(
{
  transports: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
    rotateTransport
  ],
  exceptionHandlers: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
    rotateTransportException
  ],
  exitOnError: false
});

module.exports = logger;
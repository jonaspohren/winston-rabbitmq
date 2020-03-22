const Transport = require('winston-transport');
const RabbitMQ = require('./RabbitMQ');

class WinstonRabbitMQ extends Transport {
  constructor(opts) {
    super(opts);

    this.amqp = new RabbitMQ(opts);
  }

  log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    this.amqp.publish(JSON.stringify({ ...info, timestamp: Date.now() }));

    callback();
  }
}

module.exports = WinstonRabbitMQ;

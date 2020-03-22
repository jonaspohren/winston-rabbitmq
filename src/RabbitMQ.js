const amqp = require('amqplib');

class RabbitMQ {
  constructor(options) {
    this.connectionStatus = 0;
    this.connectionURL = options.connectionURL;
    this.messages = [];
    this.exchange = options.exchange;
    this.pollingTimer = null;
    this.init();
  }

  async init() {
    if (this.connectionStatus === 1 || this.connectionStatus === 2) return;

    try {
      this.connectionStatus = 1;
      this.connection = await amqp.connect(this.connectionURL);
      this.channel = await this.connection.createChannel();
      this.connectionStatus = 2;

      this.startKeepAliveTimer();

      this.connection.on('close', () => {
        this.setOffline();
      });

      this.connection.on('error', () => {
        this.setOffline();
      });

      await this.channel.assertExchange(this.exchange, 'fanout');
    } catch (err) {
      this.setOffline();
      throw err;
    }
  }

  publish(msg) {
    clearTimeout(this.keepAliveTimer);

    while (this.messages.length >= 1000) {
      this.messages.shift();
    }

    this.messages.push(msg);

    if (this.pollingTimer === null) {
      this.pollingTimer = setTimeout(() => {
        this.dispatch();
      }, 1000);
    }
  }

  setOffline() {
    this.connectionStatus = 0;
    this.connection = null;
    this.channel = null;
  }

  dispatch() {
    if (this.connectionStatus === 2) {
      this.messages.forEach((message) => {
        this.channel.publish(this.exchange, '', Buffer.from(message));
        this.messages = [];
      });

      this.pollingTimer = null;
      this.startKeepAliveTimer();
    } else {
      this.init();

      setTimeout(() => {
        this.dispatch();
      }, 5000);
    }
  }

  startKeepAliveTimer() {
    this.keepAliveTimer = setTimeout(async () => {
      if (this.connectionStatus === 2) {
        await this.connection.close();
      }
    }, 10000);
  }
}

module.exports = RabbitMQ;

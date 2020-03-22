# winston-rabbitmq

```
yarn add https://github.com/jonaspohren/winston-rabbitmq#v1.0.0
```

```javascript
const winston = require('winston');
const WinstonRabbitMQ = require('winston-rabbitmq');

const logger = winston.createLogger({
  transports: [
    new WinstonRabbitMQ({
      connectionURL: 'amqp://user:secret@127.0.0.1:5672',
      exchange: 'logs.myservice',
    }),
  ],
});
```
'use strict';

const newClient = require('rotonde-client/src/Client');

const client = newClient('ws://127.0.0.1:4224/');

client.addLocalDefinition('event', 'PROXSONAR', [{
  name: 'distance',
  type: 'number',
  units: '?',
}]);

client.onReady(() => {
  client.sendAction('SERIAL_CLOSE', {
    "port": "/dev/tty.usbserial-MBWZOEE9",
  });
  client.bootstrap({SERIAL_OPEN: {
    "port": "/dev/tty.usbserial-MBWZOEE9",
    "baud": 57600
  }}, ['SERIAL_STATUS'], ['SERIAL_READ']).then((e) => {
    if (e[0].data.status != 'SUCCESS') {
      console.log('exiting');
      process.exit(1);
    }
    let ascii = '';
    client.eventHandlers.attach('SERIAL_READ', (e) =>  {
      ascii += new Buffer(e.data.data, 'base64').toString('ascii');
      if (ascii.indexOf('\r') >= 0) {
        let s = ascii.split('\r');
        ascii = s[1];
        let attrs = s[0].split(' ');
        console.log(parseInt(attrs[0].substring(1)));
        client.sendEvent('PROXSONAR', {
          distance: parseInt(attrs[0].substring(1)),
        });
      }
    })
  });
});

client.connect();

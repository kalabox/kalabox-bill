var Client = require('../index.js').client;

var client = new Client('localhost', 12345);

client.on('event', function(evt) {
  if (evt.stdout) {
    var data = evt.stdout;
    try {
      data = JSON.parse(evt.stdout);
    } catch (err) {}
    console.log(data);
  } else {
    console.log(JSON.stringify(evt));
  }
});

client.sh('which node');

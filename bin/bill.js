#!/usr/bin/env node

// If this is a JXP packaged binary we need to shift our args
// We need to do it this way here vs global config because we parse before
// we init
if (process.isPackaged || process.IsEmbedded) {
  process.argv.unshift(process.argv[0]);
}

var argv = require('yargs').argv;

var Client = require('../index.js').client;
var server = require('../index.js').server;

var host = argv.h || 'localhost';
var port = argv.p || 1989;
var verbose = argv.v || false;
var daemon = argv.d || false;

if (!daemon) {

  var client = new Client(host, port);

  client.on('stdout', function(evt) {
    var data;
    try {
      data = JSON.parse(evt);
    } catch (err) {
      data = evt;
    }
    process.stdout.write(data);
  });

  client.on('event', function(evt) {
    if (verbose) {
      console.log(evt);
    }
  });

  client.on('exit', function(data) {
    process.exit(data.code);
  });

  if (argv.f) {
    client.sh({
      file: argv.f
    });
  } else {
    client.sh({
      cmd: argv._.join(' ')
    });
  }

} else {

  server.listen(port);

}

#!/usr/bin/env node

var argv = require('yargs').argv;

var Client = require('../index.js').client;
var server = require('../index.js').server;

var host = argv.h || 'localhost';
var port = argv.p || 8080;
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

  client.sh(argv._.join(' '));

} else {

  server.listen(port);

}

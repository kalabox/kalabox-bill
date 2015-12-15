#!/usr/bin/env node

'use strict';

// If this is a JXP packaged binary we need to shift our args
// We need to do it this way here vs global config because we parse before
// we init
if (process.isPackaged || process.IsEmbedded) {
  process.argv.unshift(process.argv[0]);
}

var argv = require('yargs').argv;
var _ = require('lodash');

var Client = require('../index.js').client;
var server = require('../index.js').server;

var host = argv.h || 'localhost';
var port = argv.p || 1989;
var verbose = argv.v || false;
var daemon = argv.d || false;

if (argv.e) {
  var env = JSON.parse(argv.e);
  _.each(env, function(val, key) {
    process.env[key] = val;
  });
}

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

  client.on('stderr', function(evt) {
    var data;
    try {
      data = JSON.parse(evt);
    } catch (err) {
      data = evt;
    }
    process.stderr.write(data);
  });

  client.on('event', function(evt) {
    if (verbose) {
      console.log(evt);
    }
  });

  client.on('exit', function(data) {
    process.exit(data.code);
  });

  var config = {};

  if (argv.f) {
    config.file = argv.f;
  } else {
    config.cmd = argv._.join(' ');
  }

  if (argv.u) {
    var parts = argv.u.split(':');
    config.user = parts[0];
    config.password = parts[1];
  }

  if (argv.copy) {
    client.copy(config);
  } else {
    client.sh(config);
  }

} else {

  server.listen(port);

}

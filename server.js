'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var Promise = require('bluebird');
var exec = require('child_process').exec;
var os = require('os');

// Create app.
var app = express();

// Use json body parser plugin.
app.use(bodyParser.json());

app.post('/sh/', function(req, res) {

  console.log('REQUEST: %s', JSON.stringify(req.body));

  res.setHeader('Content-Type', 'applicatin/json; charset=UTF-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  var opts = {
    encoding: 'utf8',
    timeout: 0
  };

  if (os.platform !== 'win32') {
    opts.shell = '/bin/bash';
  }

  var state = {};

  function write(obj) {
    res.write(JSON.stringify(obj) + '\n');
  }

  Promise.try(function() {

    // Start execution of child process.
    var ps = exec(req.body.cmd, opts);

    // Write debug information.
    write({
      debug: {
        cmd: req.body.cmd
      }
    });

    // Write a ping every 5 seconds.
    var interval = setInterval(function() {
      write({
        ping: new Date()
      });
    }, 5 * 1000);

    // Write chunks of stdout to client.
    ps.stdout.on('data', function(data) {
      write({
        stdout: data
      });
    });

    // Write chunks of stderr to client.
    ps.stderr.on('data', function(data) {
      write({
        stderr: data
      });
    });

    return Promise.all([

      Promise.fromNode(function(cb) {
        ps.on('exit', function(code) {
          // Set code in state.
          state.code = code;
          // Stop sending pings.
          clearInterval(interval);
          process.nextTick(function() {
            cb();
          });
        });
      }),

      Promise.fromNode(function(cb) {
        ps.stdout.on('end', cb);
      })

    ]);

  })
  .then(function() {
    // Write the exit event with exit code.
    write({
      exit: {
        code: state.code
      }
    });
    // End response.
    res.end();
  });

});

module.exports = {
  listen: function(port) {
    Promise.fromNode(function(cb) {
      app.listen(port, cb);
    })
    .then(function() {
      console.log('Listening on port: %s', port);
    });
  }
};

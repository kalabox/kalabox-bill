'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var Promise = require('bluebird');
var exec = require('child_process').exec;
var os = require('os');
var path = require('path');
var fs = require('fs');
var uuid = require('uuid');
var util = require('util');

// Create app.
var app = express();

// Use json body parser plugin.
app.use(bodyParser.json());

app.get('/env/', function(req, res) {
  console.log('ENV: get');
  res.write(JSON.stringify(process.env));
  res.end();
});

app.post('/env/:key', function(req, res) {
  var key = req.params.key;
  var val = req.body.val;
  console.log('ENV: set %s=%s', key, val);
  process.env[key] = val;
  res.end();
});

app.post('/copy/', function(req, res) {

  console.log('REQUEST: %s', JSON.stringify(req.body));

  res.setHeader('Content-Type', 'application/json; charset=UTF-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  return Promise.fromNode(function(cb) {
    var file = path.join(
      os.tmpdir(),
      path.basename(req.body.file)
    );
    console.log(file);
    fs.writeFile(file,
      req.body.data,
      {encoding: 'utf8', mode: '0770'},
      cb
    );
  })
  .then(function() {
    return Promise.fromNode(function(cb) {
      res.write(JSON.stringify({status: 'OK'}), cb);
    });
  })
  .then(function() {
    res.end();
  });

});

app.post('/sh/', function(req, res) {

  console.log('REQUEST: %s', JSON.stringify(req.body));

  res.setHeader('Content-Type', 'application/json; charset=UTF-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  var opts = {
    encoding: 'utf8',
    timeout: 0,
    env: process.env,
    maxBuffer: 20 * 1024 * 1024
  };

  if (os.platform() === 'win32') {
    opts.shell = 'cmd.exe';
  }
  else {
    opts.shell = '/bin/bash';
  }

  var state = {};

  var writes = Promise.resolve();

  function write(obj) {
    writes = writes.then(function() {
      return Promise.fromNode(function(cb) {
        res.write(JSON.stringify(obj) + '\n', cb);
      });
    });
  }

  return Promise.try(function() {

    var ext = (os.platform() === 'win32') ? 'bat' : 'sh';
    var file = path.join(
      os.tmpdir(),
      [uuid.v4(), ext].join('.')
    );

    return Promise.fromNode(function(cb) {
      fs.writeFile(file,
        req.body.cmd,
        {encoding: 'utf8', mode: '0777'},
        cb
      );
    })
    .return(file)
    .tap(function(file) {
      console.log(file);
    });

  })

  .then(function(file) {
    var user = req.body.user || 'kalabox';
    var password = req.body.password || 'kalabox';
    if (os.platform() === 'win32') {
      return util.format('"%s"', file);
    } else {
      return util.format(
        'echo "%s" | sudo -S -i -u %s /bin/bash %s',
        password,
        user,
        file
      );
    }

  })

  .then(function(cmd) {

    console.log('CMD: %s', cmd);

    // Start execution of child process.
    var ps = exec(cmd, opts);

    // Write debug information.
    write({
      debug: {
        cmd: cmd
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
    // Wait for all writes to finish.
    return writes.then(function() {
      // End response.
      res.end();
    });
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

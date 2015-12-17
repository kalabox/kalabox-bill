'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var http = require('http');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var JSONStream = require('json-stream');
var fs = require('fs');
var path = require('path');
var rest = require('restler');
var url = require('url');
var VError = require('verror');

var actions = [
  'debug',
  'end',
  'event',
  'exit',
  'ping',
  'stderr',
  'stdout'
];

function Client(host, port) {
  if (this instanceof Client) {
    this.host = host;
    this.port = port || 1989;
  } else {
    return new Client(host, port);
  }
}
util.inherits(Client, EventEmitter);

Client.prototype.getEnv = function() {

  var self = this;

  return Promise.fromNode(function(cb) {
    rest.get(
      url.format({
        protocol: 'http',
        hostname: self.host,
        port: self.port,
        pathname: 'env'
      })
    )
    .on('success', function(data) {
      Promise.try(function() {
        return JSON.parse(data);
      })
      .catch(function(err) {
        throw new VError(err, 'Error parsing json data: ' + data);
      })
      .nodeify(cb);
    })
    .on('error', cb)
    .on('fail', function(data) {
      cb(new Error(data));
    });
  });

};

Client.prototype.setEnv = function(key, val) {

  var self = this;

  return Promise.fromNode(function(cb) {
    console.log(val);
    rest.postJson(
      url.format({
        protocol: 'http',
        hostname: self.host,
        port: self.port,
        pathname: 'env/' + key
      }),
      {
        val: val
      }
    )
    .on('success', function(data) {
      cb(null, data);
    })
    .on('error', cb)
    .on('fail', function(data) {
      cb(new Error(data));
    });
  });

};

Client.prototype.sh = function(config) {

  var self = this;

  return Promise.try(function() {

    if (config.file) {
      return Promise.fromNode(function(cb) {
        fs.readFile(config.file, {encoding: 'utf8'}, cb);
      });
    } else {
      return config.cmd;
    }

  })
  .then(function(cmd) {

    return Promise.fromNode(function(cb) {

      var postData = {
        cmd: cmd
      };
      if (config.user) {
        postData.user = config.user;
      }
      if (config.password) {
        postData.password = config.password;
      }

      postData = JSON.stringify(postData);

      var opts = {
        hostname: self.host,
        port: self.port,
        path: '/sh',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length
        }
      };

      var req = http.request(opts, function(res) {
        res.setEncoding('utf8');
        var events = new JSONStream();
        res.pipe(events);
        events.on('data', function(evt) {
          var action = _.find(actions, function(action) {
            return evt[action];
          });
          self.emit('event', evt);
          if (action) {
            self.emit(action, evt[action]);
          } else {
            throw new Error('Invalid action: ' + JSON.stringify(evt));
          }
        });
        res.on('error', cb);
        res.on('end', cb);
      });

      req.write(postData);
      req.end();

    });

  });

};

Client.prototype.copy = function(config) {

  var self = this;

  return Promise.try(function() {
    return Promise.fromNode(function(cb) {
      fs.readFile(config.file, {encoding: 'utf8'}, cb);
    });
  })
  .then(function(data) {

    return Promise.fromNode(function(cb) {

      var postData = {
        file: path.basename(config.file),
        data: data
      };

      postData = JSON.stringify(postData);

      var opts = {
        hostname: self.host,
        port: self.port,
        path: '/copy',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length
        }
      };

      var req = http.request(opts, function(res) {
        res.setEncoding('utf8');
        res.on('data', function(data) {
          self.emit('data', data);
        });
        res.on('error', cb);
        res.on('end', cb);
      });

      req.write(postData);
      req.end();

    });

  });

};

module.exports = Client;

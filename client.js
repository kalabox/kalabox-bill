'use strict';

var _ = require('lodash');
var Promise = require('bluebird');
var http = require('http');
var url = require('url');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var JSONStream = require('json-stream');
var fs = require('fs');

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

module.exports = Client;

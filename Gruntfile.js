'use strict';

module.exports = function(grunt) {

  //--------------------------------------------------------------------------
  // SETUP CONFIG
  //--------------------------------------------------------------------------

  // Helpful vars
  var platform = process.platform;
  var version = 'v' + require('./package.json').version;

  // Figure out what our compiled binary will be called
  var binExt = (platform === 'win32') ? '.exe' : '';
  var releaseName = ['bill', platform, process.arch, version].join('-');

  // Build commands
  var jxAddPatterns = [
    '*.js',
    '*.json'
  ];
  var jxSlimPatterns = [
    '*.spec',
    '*test/*',
    '.git/*'
  ];
  var jxCmd = [
    'jx package',
    'bin/bill.js',
    'dist/bill',
    '--add "' + jxAddPatterns.join(',') + '"',
    '--slime "' + jxSlimPatterns.join(',') + '"',
    '--native'
  ];
  var buildCmds = [
    'npm install --production',
    'mkdir dist',
    jxCmd.join(' ')
  ];

  // Add additional build cmd for POSIX
  if (platform !== 'win32') {
    buildCmds.push('chmod +x dist/bill');
    buildCmds.push('sleep 2');
  }

  // Setup task config
  var config = {

    // Some helpful file groups
    files: {
      // Relevant build files
      build: {
        src: [
          'bin/bill.js',
          'client.js',
          'index.js',
          'server.js',
          'package.json',
          'server.js'
        ],
      }
    },

    // Copy tasks
    copy: {
      // Copy build files to build directory
      build: {
        src: '<%= files.build.src %>',
        dest: 'build/'
      },
      // Copy build artifacts to dist directory
      dist: {
        src: 'build/dist/bill' + binExt,
        dest: 'dist/' + releaseName + binExt,
        options: {
          mode: true
        }
      }
    },

    // Clean pathzzz
    clean: {
      build: ['build'],
      dist: ['dist']
    },

    // Shell tasks for building
    shell: {
      build: {
        options: {
          execOptions: {
            cwd: 'build'
          }
        },
        command: buildCmds.join(' && ')
      }
    },

  };

  //--------------------------------------------------------------------------
  // LOAD TASKS
  //--------------------------------------------------------------------------

  // load task config
  grunt.initConfig(config);

  // load grunt-* tasks from package.json dependencies
  require('matchdep').filterAll('grunt-*').forEach(grunt.loadNpmTasks);

  //--------------------------------------------------------------------------
  // SETUP WORKFLOWS
  //--------------------------------------------------------------------------

  // Build a binary
  grunt.registerTask('build', [
    'clean:build',
    'clean:dist',
    'copy:build',
    'shell:build',
    'copy:dist'
  ]);

};

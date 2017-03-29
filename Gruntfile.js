module.exports = function(grunt) {

var loader = require('load-grunt-config-data')(grunt);

// initialize config
var config = {pkg: grunt.file.readJSON('./package.json')};

// load configuration (if some file exports an fn() a deep clone of `config` is provided to it)
grunt.util._.merge(config, loader.load('config/parameters.json'));
loader.merge('config/collections.json', config);

grunt.initConfig(config);

grunt.initConfig({
  mongoimport: {
    options: {
      db : config.dev.db,
      host : config.dev.url, //optional
      port: config.host, //optional
      username : config.dev.user, //optional
      password : config.dev.pwd,  //optional
      stopOnError : false,  //optional
      collections : config.collections
    }
  }
});

grunt.loadNpmTasks('grunt-mongoimport');

};

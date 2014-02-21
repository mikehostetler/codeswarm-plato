var path   = require('path');
var async  = require('async');
var shelly = require('shelly');

module.exports = inject;

function inject(stage, dir, files, cb) {

  var fileNames = Object.keys(files);
  async.eachSeries(fileNames, injectOneFile, cb);

  function injectOneFile(fileName, cb) {
    async.series([mkdirp, placeFile], cb);

    function mkdirp(cb) {
      var dirname = path.dirname(fileName);
      if (dirname == '.') return cb();
      console.log('MKDIRPING', dirname);
      stage.command('mkdir', ['-p', dirname], { cwd: dir, silent: true }).
        once('close', closed);

      function closed(code) {
        console.log('MKDIRPED', code);
        if (code != 0)
          cb(new Error('mkdirp command closed with error ' + code));
        else cb();
      }
    }

    function placeFile(cb) {
      var content = files[fileName];
      if ('string' != typeof content) content = JSON.stringify(content);

      var subCommand = shelly('echo ? > ?', content, fileName);
      var command = stage.command('bash', ['-c', subCommand], { cwd: dir, silent: true });
      command.stderr.setEncoding('utf8');
      var stderr = '';
      command.stderr.on('data', function(d) {
        stderr += d;
      });
      command.once('close', closed);

      function closed(code) {
        if (code != 0)
          cb(new Error(
            'error injecting ' + fileName +
            ', exited with code ' + code + ': ' + stderr));
        else cb();
      }
    }

  }

}
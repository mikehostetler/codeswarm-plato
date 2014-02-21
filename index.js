var inject = require('./inject');
var collect = require('./collect');

var PLATO_ARGS = [
  '-q',
  '-r',
  '-x', 'node_modules|\\.json'];


/// analyze

exports.analyze = analyze;

function analyze(build, stage, previousBuild) {
  var platoDir = '/tmp/plato-' + build.dir;

  var platoResults;

  async.series([
    mkdirp,
    _inject,
    run,
    _collect
    ], done);

  function mkdirp(cb) {
    stage.command('mkdir', ['-p', platoDir]).once('close', cb);
  }

  function _inject(cb) {
    if (previousBuild && previousBuild.data && previousBuild.data.plato)
      inject(stage, platoDir, previousBuild.data.plato, cb);
    else
      process.nextTick(cb);
  }

  function run(cb) {
    var args = PLATO_ARGS.concat(['-d', platoDir, '.']);
    stage.command('plato', args).once('close', cb);
  }

  function _collect(cb) {
    collect(platoDir, stage, collected);

    function collected(platoOutput) {
      platoResults = platoOutput;
      cb();
    }
  }

  function done(err) {
    if (err) stage.emit('error', err);
    else stage.end({plato: platoResults});
  }
}
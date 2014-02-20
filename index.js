var PLATO_ARGS = [
  '-q',
  '-r',
  '-x', 'node_modules|\\.json',
  '-d', './.plato',
  '.'];


/// analyze

exports.analyze = analyze;

function analyze(build, stage) {
  async.series([
    inject,
    run,
    collect
    ], done);

  function inject(cb) {
    process.nextTick(cb);
  }

  function run(cb) {
    stage.command('plato', PLATO_ARGS).once('close', cb);
  }

  function collect(cb) {
    process.nextTick(cb);
  }

  function done(err) {
    console.log('PLATO DONE', arguments);
    if (err) stage.emit('error', err);
    else stage.end();
  }
}

// function init(config, job, context, cb) {

//   if (! config) config = {};

//   var plugin = {};

//   plugin.path = __dirname + '/node_modules/.bin';


//   /// prepare

//   plugin.prepare = prepare;
//   function prepare(context, done) {
//     inject(context, done);
//   }


//   /// test

//   plugin.test = test;

//   function test(ctx, cb) {

//     var id = ctx.job._id;
//     var platoOutDir = '/tmp/plato-' + id;
//     var cmd = 'plato';
//     var args = PLATO_ARGS.concat(['-d', platoOutDir, '.']);

//     var opts = {
//       cwd: ctx.dataDir,
//       cmd: {
//         command: cmd,
//         args: args,
//         screen: 'Generating plato stats...'
//       }
//     };
//     ctx.cmd(opts, done);

//     function done(code, stdout, stderr) {
//       if (code == 0) {
//         collect(platoOutDir, ctx, cb);
//       } else cb(code, stdout, stderr);
//     }
//   }

//   cb(null, plugin);
// }
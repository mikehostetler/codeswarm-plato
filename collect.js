module.exports = collect;

function collect(platoOutDir, ctx, cb) {

  ctx.comment('Collecting plato reports');

  var cmd = 'find';
  var args = [
    '.',
    '-type', 'f',  // file type
    '-name', '*.json', // only json files
    '-exec', 'printf', '\n\n{}\n', '\;',
    '-exec', 'cat', '{}', '\;'
    ];

  var opts = {
    cwd: platoOutDir,
    cmd: {
      command: cmd,
      args: args,
      screen: 'Collecting plato reports...'
    }
  }
  ctx.cmd(opts, collected);

  function collected(code, stdout, stderr) {
    if (code != 0) return cb(new Error(stderr));

    ctx.comment('Collected plato reports');

    var reports;
    try {
      reports = parsePlatoOutput(stdout);
    } catch(err) {
      err.message = 'Error parsing plato output: ' + err.message;
      return cb(err);
    }

    ctx.comment('Parsed plato reports');

    ctx.data({reports: reports});

    cb(code, stdout, stderr);
  }
}

function parsePlatoOutput(out) {
  var parts = out.split('\n\n').filter(notEmpty).map(trim);
  var doc = {};
  parts.forEach(function(part) {
    var subparts = part.split('\n');
    var filename = subparts[0];
    var json = subparts[1];

    try {
      json = JSON.parse(json);
    } catch(err) {
      err.message = 'Error in part for file name ' + filename + ': ' + err.message;
      throw err;
    }

    filename = filename.
      substr(0, filename.indexOf('.json')).
      substr(2).
      replace('.history', '__history');

    doc[filename] = json;
  });

  return doc;
}

function notEmpty(s) {
  return s.trim().length > 0;
}

function trim(s) {
  return s.trim();
}
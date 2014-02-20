module.exports = collect;

function collect(platoOutDir, stage, cb) {

  var args = [
    '.',
    '-type', 'f',  // file type
    '-name', '*.json', // only json files
    '-exec', 'printf', '\n\n{}\n', '\;',
    '-exec', 'cat', '{}', '\;'
    ];

  var child = stage.command('find', args, { cwd: platoOutDir, silent: true });
  child.stdout.setEncoding('utf-8');
  child.stdout.on('data', onChildData);
  child.once('close', onChildExit);

  var out = '';
  function onChildData(d) {
    out += d;
  }

  function onChildExit(code) {
    if (code != 0) return stage.emit('error', new Error('find exited with error code ' + code));
    var platoOutput = parsePlatoOutput(out);
    cb(platoOutput);
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
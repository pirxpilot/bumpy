
var semver = require('semver');
var fs = require('fs');
var path = require('path');
var util = require('util');

/**
 * Expose `bumpy`
 */

module.exports = bumpy;

/**
 * Bump the version of the package in `dir`
 *
 * @api public
 * @param {String} dir
 * @param {String} release
 * @param {Function} cb
 */

function bumpy(dir, release, cb) {
  var current;

  function next(index) {
    var file = bumpy.files[index];
    if (!file) return cb(null, current);
    file = path.join(dir, file);

    fs.readFile(file, 'utf-8', function (err, data) {
      if (err) {
        // don't error on missing files
        if ('ENOENT' === err.code) return next(index + 1);
        return cb(err);
      }

      var json = null;
      try {
        json = JSON.parse(data);
      } catch (err) {
        return cb(err);
      }

      var version = json.version;
      var bumped = semver.inc(version, release);

      if (!current) {
        current = bumped;
      }
      else if (current !== bumped) {
        return cb({
          message: util.format('Inconsistent versions:\n%s\t\%s\n%s\tin other files', bumped, file, current)
        });
      }

      json.version = bumped;
      var str = JSON.stringify(json, null, 2);
      fs.writeFile(file, str, function (err) {
        if (err) return cb(err);
        next(index + 1);
      });
    });
  }

  next(0);
}

/**
 * Default files.
 */

bumpy.files = [
  'package.json',
  'component.json'
];

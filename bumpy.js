const semver = require('semver');
const fs = require('fs');
const path = require('path');
const util = require('util');

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
  let current;

  function next(index) {
    let file = bumpy.files[index];
    if (!file) return cb(null, current);
    file = path.join(dir, file);

    fs.readFile(file, 'utf-8', function (err, data) {
      if (err) {
        // don't error on missing files
        if ('ENOENT' === err.code) return next(index + 1);
        return cb(err);
      }

      let json = null;
      try {
        json = JSON.parse(data);
      } catch (err) {
        return cb(err);
      }

      const version = json.version;
      const bumped = semver.inc(version, release);

      if (!current) {
        current = bumped;
      } else if (current !== bumped) {
        return cb({
          message: util.format(
            'Inconsistent versions:\n%s\t%s\n%s\tin other files',
            bumped,
            file,
            current
          )
        });
      }

      json.version = bumped;
      const str = JSON.stringify(json, null, 2);
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

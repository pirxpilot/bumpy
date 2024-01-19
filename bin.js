#!/usr/bin/env node

const bumpy = require('./bumpy');
const path = require('path');
const home = require('home-dir').directory;
const fs = require('fs');

const releases = ['major', 'minor', 'patch'];
const release = process.argv[2];
const ignore = '--ignorerc' === process.argv[3] || '-i' === process.argv[3];

process.title = 'bumpy';

main();

function main() {
  if ('--help' === release || '-h' === release) return usage();
  if ('--version' === release || '-v' === release) return version();

  if (!~releases.indexOf(release)) {
    return error(
      [
        'Invalid or missing release.  Must be one of the following:',
        '  ' + releases.join(', ')
      ].join('\n')
    );
  }

  // config file support
  if (!ignore) {
    try {
      const rc = path.join(home, '.bumpyrc');
      const data = fs.readFileSync(rc);
      const json = JSON.parse(data);
      const files = json.files;
      if (files && files.length) {
        bumpy.files = files;
      }
    } catch (err) {
      if ('ENOENT' !== err.code) {
        return error(err.message);
      }
    }
  }
}

bumpy(process.cwd(), release, function (err, version) {
  if (err) return error(err.message);
  if (version) console.log(version);
});

/**
 * Output the given error `msg`
 */

function error(msg) {
  console.error(msg);
  process.exit(1);
}

/**
 * Output usage information
 */

function usage() {
  console.log(
    [
      '',
      '  Usage: bumpy <release> [options]',
      '',
      '  Releases:',
      '',
      '    - major',
      '    - minor',
      '    - patch',
      '',
      '  Options:',
      '',
      '    -h, --help           output usage information',
      '    -V, --version        output the version number',
      '    -i, --ignore         ignore settings in ~/.bumpyrc',
      ''
    ].join('\n')
  );
  process.exit(0);
}

/**
 * Output the current version
 */

function version() {
  console.log('v' + require('./package.json').version);
  process.exit(0);
}

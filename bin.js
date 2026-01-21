#!/usr/bin/env node

import fs from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import semver from 'semver';
import bumpy from './bumpy.js';
import packageJSON from './package.json' with { type: 'json' };

const releases = ['major', 'minor', 'patch'];
const release = process.argv[2];
const ignore = '--ignorerc' === process.argv[3] || '-i' === process.argv[3];

process.title = 'bumpy';

main(release)
  .then(bumped => console.log(bumped))
  .catch(err => error(err.message));

async function main(release) {
  if ('--help' === release || '-h' === release) return usage();
  if ('--version' === release || '-v' === release) return version();

  let overwrite;
  if (!releases.includes(release)) {
    // check if valid release number
    if (!semver.valid(release)) {
      return error(
        [
          'Invalid or missing release.  Must be one of the following:',
          `  ${releases.join(', ')}`,
          'Or a valid version number.'
        ].join('\n')
      );
    }
    overwrite = release;
    release = false;
  }

  // config file support
  if (!ignore) {
    try {
      const rc = path.join(homedir(), '.bumpyrc');
      const data = await fs.readFile(rc);
      const json = JSON.parse(data);
      const files = json.files;
      if (files?.length) {
        bumpy.files = files;
      }
    } catch (err) {
      if ('ENOENT' !== err.code) {
        return error(err.message);
      }
    }
  }
  return bumpy(process.cwd(), release, overwrite);
}

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
  console.log(`v${packageJSON.version}`);
  process.exit(0);
}

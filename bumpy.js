const fs = require('node:fs/promises');
const path = require('node:path');
const util = require('node:util');

const semver = require('semver');

module.exports = bumpy;

/**
 * Bump the version of the package in `dir`
 *
 * @api public
 * @param {String} dir
 * @param {String} release
 */
async function bumpy(dir, release) {
  let current;

  const result = await Promise.allSettled(bumpy.files.map(read));
  const changes = result.filter(check).map(inc);
  await Promise.all(changes.map(write));

  return current;

  function check({ reason }) {
    // no reason - means file was read OK
    if (!reason) return true;
    // missing files are OK but lets filter them out
    if ('ENOENT' === reason.code) return false;
    // everything else is a problem
    throw reason;
  }

  function inc({ value }) {
    const { file, json } = value;
    const bumped = semver.inc(json.version, release);
    if (!current) {
      current = bumped;
    } else if (current !== bumped) {
      const message = util.format(
        'Inconsistent versions:\n%s\t%s\n%s\tin other files',
        bumped,
        file,
        current
      );
      throw new Error(message);
    }
    json.version = bumped;
    return value;
  }

  async function read(name) {
    const file = path.join(dir, name);
    const data = await fs.readFile(file, 'utf-8');
    const suffix = data.match(/([\r\n]+)$/gm);
    const json = JSON.parse(data);
    return {
      file,
      json,
      suffix: suffix?.[0]
    };
  }

  async function write({ file, json, suffix }) {
    let str = JSON.stringify(json, null, 2);
    if (suffix) {
      str += suffix;
    }
    await fs.writeFile(file, str);
  }
}

/**
 * Default files.
 */

bumpy.files = [
  'package.json',
  'component.json'
];

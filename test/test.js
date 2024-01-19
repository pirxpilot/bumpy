const { describe, it, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const bumpy = require('..');
const fs = require('fs');
const path = require('path');
const fixture = path.join.bind(path, __dirname, 'fixtures');
const read = fs.readFileSync;

const originals = {
  'component.json': read(fixture('component.json')),
  'package.json': read(fixture('package.json')),
  'foo.json': read(fixture('foo.json'))
};

const files = bumpy.files;

describe('bumpy', async function () {
  // reset
  afterEach(async function () {
    await Promise.all(Object.entries(originals).map(
      ([file, data]) => fs.promises.writeFile(fixture(file), data)
    ));
    bumpy.files = files;
  });

  await it('should bump patch numbers', async function () {
    await bumpy(fixture(), 'patch');
    assert.equal(version('component.json'), '0.0.1');
    assert.equal(version('package.json'), '0.0.1');
  });

  await it('should bump minor numbers', async function () {
    await bumpy(fixture(), 'minor');
    assert.equal(version('component.json'), '0.1.0');
    assert.equal(version('package.json'), '0.1.0');
  });

  await it('should bump major numbers', async function () {
    await bumpy(fixture(), 'major');
    assert.equal(version('component.json'), '1.0.0');
    assert.equal(version('package.json'), '1.0.0');
  });

  await it('should allow overwriting version number', async function () {
    await bumpy(fixture(), false, '4.2.1');
    assert.equal(version('component.json'), '4.2.1');
    assert.equal(version('package.json'), '4.2.1');
  });

  await it('should allow for clobbering defaults files', async function () {
    bumpy.files.push('foo.json');
    await bumpy(fixture(), 'major');
    assert.equal(version('component.json'), '1.0.0');
    assert.equal(version('package.json'), '1.0.0');
    assert.equal(version('foo.json'), '1.0.0');
  });
});

function version(file) {
  return JSON.parse(read(fixture(file))).version;
}

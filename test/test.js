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

describe('bumpy', function () {
  // reset
  afterEach(function () {
    for (const file in originals) {
      fs.writeFileSync(fixture(file), originals[file]);
    }
    bumpy.files = files;
  });

  it('should bump patch numbers', function (_, done) {
    bumpy(fixture(), 'patch', function (err) {
      assert.ifError(err);
      assert.equal(version('component.json'), '0.0.1');
      assert.equal(version('package.json'), '0.0.1');
      done();
    });
  });

  it('should bump minor numbers', function (_, done) {
    bumpy(fixture(), 'minor', function (err) {
      assert.ifError(err);
      assert.equal(version('component.json'), '0.1.0');
      assert.equal(version('package.json'), '0.1.0');
      done();
    });
  });

  it('should bump major numbers', function (_, done) {
    bumpy(fixture(), 'major', function (err) {
      assert.ifError(err);
      assert.equal(version('component.json'), '1.0.0');
      assert.equal(version('package.json'), '1.0.0');
      done();
    });
  });

  it('should allow for clobbering defaults files', function (_, done) {
    bumpy.files.push('foo.json');
    bumpy(fixture(), 'major', function (err) {
      assert.ifError(err);
      assert.equal(version('component.json'), '1.0.0');
      assert.equal(version('package.json'), '1.0.0');
      assert.equal(version('foo.json'), '1.0.0');
      done();
    });
  });
});

function version(file) {
  return JSON.parse(read(fixture(file))).version;
}

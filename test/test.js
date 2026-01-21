import { readFileSync as read, writeFileSync as write } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import bumpy from '../bumpy.js';

const fixture = path.join.bind(path, import.meta.dirname, 'fixtures');

const originals = {
  'component.json': read(fixture('component.json')),
  'package.json': read(fixture('package.json')),
  'foo.json': read(fixture('foo.json'))
};

const files = bumpy.files;

test('bumpy', async t => {
  // reset
  t.afterEach(() => {
    Object.entries(originals).forEach(([file, data]) => write(fixture(file), data));
    bumpy.files = files;
  });

  await t.test('should bump patch numbers', async t => {
    await bumpy(fixture(), 'patch');
    t.assert.equal(version('component.json'), '0.0.1');
    t.assert.equal(version('package.json'), '0.0.1');
  });

  await t.test('should bump minor numbers', async t => {
    await bumpy(fixture(), 'minor');
    t.assert.equal(version('component.json'), '0.1.0');
    t.assert.equal(version('package.json'), '0.1.0');
  });

  await t.test('should bump major numbers', async t => {
    await bumpy(fixture(), 'major');
    t.assert.equal(version('component.json'), '1.0.0');
    t.assert.equal(version('package.json'), '1.0.0');
  });

  await t.test('should allow overwriting version number', async t => {
    await bumpy(fixture(), false, '4.2.1');
    t.assert.equal(version('component.json'), '4.2.1');
    t.assert.equal(version('package.json'), '4.2.1');
  });

  await t.test('should allow for clobbering defaults files', async t => {
    bumpy.files.push('foo.json');
    await bumpy(fixture(), 'major');
    t.assert.equal(version('component.json'), '1.0.0');
    t.assert.equal(version('package.json'), '1.0.0');
    t.assert.equal(version('foo.json'), '1.0.0');
  });
});

function version(file) {
  return JSON.parse(read(fixture(file))).version;
}

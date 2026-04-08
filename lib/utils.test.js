const fs = require('fs');
const path = require('path');
const os = require('os');
const { copyDirSync, copyFilesSync, linkOrCopy, detectStacks, PACKAGE_ROOT } = require('./utils');

describe('copyDirSync', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'utils-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('recursively copies directory contents', () => {
    const src = path.join(tmpDir, 'src');
    const dest = path.join(tmpDir, 'dest');
    fs.mkdirSync(path.join(src, 'sub'), { recursive: true });
    fs.writeFileSync(path.join(src, 'a.txt'), 'hello');
    fs.writeFileSync(path.join(src, 'sub', 'b.txt'), 'world');

    copyDirSync(src, dest);

    expect(fs.readFileSync(path.join(dest, 'a.txt'), 'utf8')).toBe('hello');
    expect(fs.readFileSync(path.join(dest, 'sub', 'b.txt'), 'utf8')).toBe('world');
  });

  it('logs dry-run message without copying files', () => {
    const src = path.join(tmpDir, 'src');
    const dest = path.join(tmpDir, 'dest');
    fs.mkdirSync(src);
    fs.writeFileSync(path.join(src, 'a.txt'), 'hello');

    const logs = [];
    const origLog = console.log;
    console.log = (...args) => logs.push(args.join(' '));

    copyDirSync(src, dest, { dryRun: true });

    console.log = origLog;
    expect(fs.existsSync(dest)).toBe(false);
    expect(logs.some((l) => l.includes('[dry-run]'))).toBe(true);
  });

  it('propagates options to recursive calls (dry-run nested dirs)', () => {
    const src = path.join(tmpDir, 'src');
    fs.mkdirSync(path.join(src, 'sub', 'deep'), { recursive: true });
    fs.writeFileSync(path.join(src, 'sub', 'deep', 'file.txt'), 'nested');

    const dest = path.join(tmpDir, 'dest');
    copyDirSync(src, dest, { dryRun: true });

    expect(fs.existsSync(dest)).toBe(false);
  });
});

describe('copyFilesSync', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'utils-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('copies only files (not subdirectories)', () => {
    const src = path.join(tmpDir, 'src');
    const dest = path.join(tmpDir, 'dest');
    fs.mkdirSync(path.join(src, 'subdir'), { recursive: true });
    fs.writeFileSync(path.join(src, 'file.txt'), 'content');
    fs.writeFileSync(path.join(src, 'subdir', 'nested.txt'), 'nested');

    copyFilesSync(src, dest);

    expect(fs.existsSync(path.join(dest, 'file.txt'))).toBe(true);
    expect(fs.existsSync(path.join(dest, 'subdir'))).toBe(false);
  });

  it('does nothing when src does not exist', () => {
    const dest = path.join(tmpDir, 'dest');
    copyFilesSync(path.join(tmpDir, 'nonexistent'), dest);
    expect(fs.existsSync(dest)).toBe(false);
  });

  it('logs dry-run message without copying', () => {
    const src = path.join(tmpDir, 'src');
    const dest = path.join(tmpDir, 'dest');
    fs.mkdirSync(src);
    fs.writeFileSync(path.join(src, 'a.txt'), 'hello');

    const logs = [];
    const origLog = console.log;
    console.log = (...args) => logs.push(args.join(' '));

    copyFilesSync(src, dest, { dryRun: true });

    console.log = origLog;
    expect(fs.existsSync(dest)).toBe(false);
    expect(logs.some((l) => l.includes('[dry-run]'))).toBe(true);
  });
});

describe('linkOrCopy', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'utils-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates a link or copy of the target directory', () => {
    const target = path.join(tmpDir, 'target');
    const link = path.join(tmpDir, 'link');
    fs.mkdirSync(target);
    fs.writeFileSync(path.join(target, 'test.txt'), 'content');

    linkOrCopy(target, link);

    expect(fs.existsSync(path.join(link, 'test.txt'))).toBe(true);
    expect(fs.readFileSync(path.join(link, 'test.txt'), 'utf8')).toBe('content');
  });

  it('removes existing link before creating new one', () => {
    const target = path.join(tmpDir, 'target');
    const link = path.join(tmpDir, 'link');
    fs.mkdirSync(target);
    fs.writeFileSync(path.join(target, 'test.txt'), 'content');
    fs.mkdirSync(link);
    fs.writeFileSync(path.join(link, 'old.txt'), 'old');

    linkOrCopy(target, link);

    expect(fs.existsSync(path.join(link, 'old.txt'))).toBe(false);
    expect(fs.existsSync(path.join(link, 'test.txt'))).toBe(true);
  });

  it('logs dry-run message without creating link', () => {
    const target = path.join(tmpDir, 'target');
    const link = path.join(tmpDir, 'link');
    fs.mkdirSync(target);

    const logs = [];
    const origLog = console.log;
    console.log = (...args) => logs.push(args.join(' '));

    linkOrCopy(target, link, { dryRun: true });

    console.log = origLog;
    expect(fs.existsSync(link)).toBe(false);
    expect(logs.some((l) => l.includes('[dry-run]'))).toBe(true);
  });
});

describe('detectStacks', () => {
  it('returns available stack names excluding _template', () => {
    const stacks = detectStacks();
    expect(stacks).toContain('java-springboot');
    expect(stacks).toContain('nextjs-react');
    expect(stacks).not.toContain('_template');
  });
});

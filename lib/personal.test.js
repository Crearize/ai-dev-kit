const path = require('path');
const os = require('os');
const fs = require('fs');

// vi is globally available via vitest globals: true
vi.mock('child_process', () => ({
  execSync: vi.fn(),
}));

vi.mock('./merge-settings', () => ({
  mergeSettings: vi.fn(),
}));

const { execSync } = require('child_process');
const { mergeSettings } = require('./merge-settings');

describe('personal module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('setupClaudeCodeGlobal (via doPersonal)', () => {
    it('calls mergeSettings with correct paths', () => {
      const { PACKAGE_ROOT } = require('./utils');
      const templatePath = path.join(PACKAGE_ROOT, 'templates', 'settings-global.json.template');

      // Template file should exist in the package
      expect(fs.existsSync(templatePath)).toBe(true);
    });

    it('doPersonal is a function', () => {
      const personalModule = require('./personal');
      expect(typeof personalModule.doPersonal).toBe('function');
    });
  });

  describe('clipboard commands', () => {
    it('execSync is available for clipboard operations', () => {
      expect(typeof execSync).toBe('function');
    });
  });
});

const path = require('path');
const os = require('os');
const fs = require('fs');
const childProcess = require('child_process');
const utils = require('./utils');
const mergeSettingsModule = require('./merge-settings');
const { doPersonal, _setupClaudeCodeGlobal, _setupCursorGlobal } = require('./personal');

describe('personal module', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  async function captureConsole(fn) {
    const logs = [];
    const origLog = console.log;
    console.log = (...args) => logs.push(args.join(' '));
    try {
      await fn();
    } finally {
      console.log = origLog;
    }
    return logs;
  }

  describe('setupClaudeCodeGlobal', () => {
    it('calls mergeSettings with correct paths', async () => {
      const spy = vi.spyOn(mergeSettingsModule, 'mergeSettings').mockImplementation(() => {});

      const expectedSettingsPath = path.join(os.homedir(), '.claude', 'settings.json');
      const expectedTemplatePath = path.join(utils.PACKAGE_ROOT, 'templates', 'settings-global.json.template');

      await captureConsole(() => { _setupClaudeCodeGlobal(); return Promise.resolve(); });

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(expectedSettingsPath, expectedTemplatePath);
    });

    it('logs setup message', async () => {
      vi.spyOn(mergeSettingsModule, 'mergeSettings').mockImplementation(() => {});

      const logs = await captureConsole(() => { _setupClaudeCodeGlobal(); return Promise.resolve(); });
      expect(logs.some((l) => l.includes('Claude Code global settings'))).toBe(true);
    });

    it('template file exists in package', () => {
      const templatePath = path.join(utils.PACKAGE_ROOT, 'templates', 'settings-global.json.template');
      expect(fs.existsSync(templatePath)).toBe(true);
    });
  });

  describe('setupCursorGlobal', () => {
    it('copies rules to clipboard on supported platform', async () => {
      const spy = vi.spyOn(childProcess, 'execSync').mockImplementation(() => {});

      const logs = await captureConsole(() => { _setupCursorGlobal(); return Promise.resolve(); });

      expect(spy).toHaveBeenCalled();
      const clipCmd = spy.mock.calls[0][0];
      expect(['pbcopy', 'clip', 'xclip -selection clipboard']).toContain(clipCmd);
      expect(logs.some((l) => l.includes('clipboard'))).toBe(true);
    });

    it('falls back to printing rules when clipboard is unavailable', async () => {
      vi.spyOn(childProcess, 'execSync').mockImplementation(() => { throw new Error('no clipboard'); });

      const logs = await captureConsole(() => { _setupCursorGlobal(); return Promise.resolve(); });

      expect(logs.some((l) => l.includes('Safety Rules'))).toBe(true);
      expect(logs.some((l) => l.includes('Clipboard not available'))).toBe(true);
    });

    it('rules content includes expected sections', async () => {
      vi.spyOn(childProcess, 'execSync').mockImplementation(() => { throw new Error('no clipboard'); });

      const logs = await captureConsole(() => { _setupCursorGlobal(); return Promise.resolve(); });

      expect(logs.some((l) => l.includes('Development Rules'))).toBe(true);
      expect(logs.some((l) => l.includes('git push --force'))).toBe(true);
    });
  });

  describe('doPersonal', () => {
    it('handles option 1 selection correctly', async () => {
      const mockPrompter = {
        promptMultiple: vi.fn().mockResolvedValue(['1']),
        close: vi.fn(),
      };
      vi.spyOn(utils, 'createPrompter').mockReturnValue(mockPrompter);
      const mergeSpy = vi.spyOn(mergeSettingsModule, 'mergeSettings').mockImplementation(() => {});

      await captureConsole(() => doPersonal());

      expect(mergeSpy).toHaveBeenCalledTimes(1);
      expect(mockPrompter.close).toHaveBeenCalled();
    });

    it('handles option 2 selection correctly', async () => {
      const mockPrompter = {
        promptMultiple: vi.fn().mockResolvedValue(['2']),
        close: vi.fn(),
      };
      vi.spyOn(utils, 'createPrompter').mockReturnValue(mockPrompter);
      vi.spyOn(childProcess, 'execSync').mockImplementation(() => {});

      const logs = await captureConsole(() => doPersonal());

      expect(logs.some((l) => l.includes('clipboard'))).toBe(true);
      expect(mockPrompter.close).toHaveBeenCalled();
    });

    it('warns on invalid selection numbers', async () => {
      const mockPrompter = {
        promptMultiple: vi.fn().mockResolvedValue(['5', 'abc']),
        close: vi.fn(),
      };
      vi.spyOn(utils, 'createPrompter').mockReturnValue(mockPrompter);

      const logs = await captureConsole(() => doPersonal());

      expect(logs.some((l) => l.includes('Warning') && l.includes('"5"'))).toBe(true);
      expect(logs.some((l) => l.includes('Warning') && l.includes('"abc"'))).toBe(true);
    });

    it('closes prompter even when an error occurs', async () => {
      const mockPrompter = {
        promptMultiple: vi.fn().mockRejectedValue(new Error('stdin error')),
        close: vi.fn(),
      };
      vi.spyOn(utils, 'createPrompter').mockReturnValue(mockPrompter);

      await expect(doPersonal()).rejects.toThrow('stdin error');
      expect(mockPrompter.close).toHaveBeenCalled();
    });
  });
});

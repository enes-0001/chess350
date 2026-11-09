// ESLint flat config.
// Besides normal linting, this file ENFORCES the architecture invariants from AGENTS.md §5:
//   - core is pure (no Date.now / Math.random / timers / Node or DOM APIs)
//   - packages never import each other except through @chess350/core
//   - no dangerouslySetInnerHTML
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

const noDangerousHtml = {
  selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
  message: 'Never use dangerouslySetInnerHTML (AGENTS.md invariant #10, XSS).',
};

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/playwright-report/**',
      '**/test-results/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
      eqeqeq: ['error', 'always'],
      'no-restricted-syntax': ['error', noDangerousHtml],
    },
  },

  // ---- core: pure domain code -------------------------------------------------
  {
    files: ['packages/core/src/**/*.ts'],
    languageOptions: { globals: {} },
    rules: {
      'no-restricted-properties': [
        'error',
        { object: 'Date', property: 'now', message: 'core is pure: pass `now` in (invariant #2).' },
        {
          object: 'Math',
          property: 'random',
          message: 'core is pure: pass randomness in (invariant #2).',
        },
        {
          object: 'performance',
          property: 'now',
          message: 'core is pure: pass `now` in (invariant #2).',
        },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'setTimeout', message: 'core is pure: no timers (invariant #2).' },
        { name: 'setInterval', message: 'core is pure: no timers (invariant #2).' },
        { name: 'window', message: 'core must not touch the DOM.' },
        { name: 'document', message: 'core must not touch the DOM.' },
        { name: 'process', message: 'core must not touch Node APIs.' },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@chess350/server', '@chess350/client', '../../server/*', '../../client/*'],
              message: 'core must not depend on server or client.',
            },
            { group: ['node:*'], message: 'core must not use Node APIs.' },
          ],
        },
      ],
    },
  },

  // ---- server ---------------------------------------------------------------
  {
    files: ['packages/server/**/*.ts'],
    languageOptions: { globals: { ...globals.node } },
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@chess350/client', '../../client/*'],
              message: 'server must not import client code.',
            },
            {
              group: ['../../core/*', '@chess350/core/src/*'],
              message: "Import from '@chess350/core', not its internals.",
            },
          ],
        },
      ],
    },
  },
  {
    // Inside rooms/ (domain logic), time must come from the injected TimeSource (invariant #3).
    files: ['packages/server/src/rooms/**/*.ts'],
    rules: {
      'no-restricted-properties': [
        'error',
        { object: 'Date', property: 'now', message: 'Use the injected TimeSource (invariant #3).' },
      ],
      'no-restricted-globals': [
        'error',
        { name: 'setTimeout', message: 'Use the injected Scheduler (invariant #3).' },
        { name: 'setInterval', message: 'Use the injected Scheduler (invariant #3).' },
      ],
    },
  },

  // ---- client ---------------------------------------------------------------
  {
    files: ['packages/client/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@chess350/server', '../../server/*'],
              message: 'client must not import server code.',
            },
            {
              group: ['../../core/*', '@chess350/core/src/*'],
              message: "Import from '@chess350/core', not its internals.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ['packages/client/e2e/**/*.ts', '**/*.config.{js,ts}', 'packages/client/sw/**/*.ts'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // Service worker template (ADR-013): runs in the SW global scope, placeholder filled at build.
    files: ['packages/client/sw/sw.template.js'],
    languageOptions: { globals: { ...globals.serviceworker, __PRECACHE__: 'readonly' } },
  },
);

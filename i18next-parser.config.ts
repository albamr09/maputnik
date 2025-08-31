export default {
  input: ['src/**/*.{ts,tsx}'],
  output: 'public/locales/$LOCALE/$NAMESPACE.json',
  locales: ['en', 'de', 'fr', 'he', 'it', 'ja', 'zh'],
  defaultLocale: 'en',
  keySeparator: false,
  nsSeparator: false,
  keepRemoved: true,
  sort: true,
  skipUntranslated: true,
  createOldCatalogs: false,
  useKeysAsDefaultValue: true,
  debug: false,
  removeUnusedKeys: true,
  contextSeparator: '_',
  interpolation: {
    prefix: '{{',
    suffix: '}}'
  }
};

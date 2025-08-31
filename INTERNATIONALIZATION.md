# Internationalization

This directory contains the translation files for Maputnik.

## Adding a new language

1. Create a new directory under `/public/locales/` for your new language.
2. Copy the `en/translation.json` file to your new language directory.
3. Translate the values in the JSON file.
4. Add your language to the `supportedLanguages` object in `src/i18n.ts`.
5. Refresh the localization to generate a new directory under `/public/locales/` for your new language.

## File structure

```
public/locales/
├── de/
│   └── translation.json
├── fr/
│   └── translation.json
├── he/
│   └── translation.json
├── it/
│   └── translation.json
├── ja/
│   └── translation.json
└── zh/
    └── translation.json
```

## Translation format

The translation files use a simple key-value format:

```json
{
  "key": "translated value"
}
```

## Notes

- English is the default language and doesn't require a translation file.
- All translation keys should be in English.
- Values should be translated to the target language.

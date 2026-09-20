# Shiritorii

A browser-only game of shiritori — Shiritori + ⛩️ torii, because the double i was
already gate-shaped.

Generated with [Angular CLI](https://github.com/angular/angular-cli) version 22.1.8.

## Vocabulary data

`public/vocabulary/jmdict-common-nouns.json` holds the word list the game checks against: the common
standalone nouns of [JMdict](https://www.edrdg.org/wiki/index.php/JMdict-EDICT_Dictionary_Project),
each with one short English gloss and its JMdict sense tags, keyed by hiragana reading.

JMdict is the property of the Electronic Dictionary Research and Development Group and is used under
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/); the derived file is available under
the same licence. See `public/vocabulary/LICENSE.txt`.

The file is committed, so neither the app build nor CI downloads anything. To refresh it from the
latest [jmdict-simplified](https://github.com/scriptin/jmdict-simplified) release:

```bash
pnpm run build:vocabulary
```

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

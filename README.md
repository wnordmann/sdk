# SDK
New javascript SDK based on React and Flux
For example usage see: https://github.com/boundlessgeo/sdk-template

## Building css (Pivotal UI)

    npm run css

## Generating API docs

    npm run docs

## Testing
    npm test

## Pre commit hook
In order to keep the full build (used by the free version of QGIS Web Application Builder) up to date, install a pre commit hook in your local git repository (.git/hooks/pre-commit):

    #!/bin/sh
    npm test
    npm run build:full
    npm run build:full:debug
    git add dist/js
    npm run css
    npm run minify:css
    git add dist/css
    npm run docs
    git add api
    npm run i18n
    git add locale/en.js

## npm run build
If you run into this error: Error: EMFILE, open 'sdk/node_modules/react/package.json' run the solution from here: https://github.com/andreypopp/react-app-express/issues/1#issuecomment-34113065

# SDK

[![Travis CI Status](https://secure.travis-ci.org/boundlessgeo/sdk.svg)](http://travis-ci.org/#!/boundlessgeo/sdk)

New javascript SDK based on React and Flux
For example usage see: https://github.com/boundlessgeo/sdk-apps

For online docs see: https://boundlessgeo.github.io/sdk/book/index.html and https://boundlessgeo.github.io/sdk/book.pdf

## Generating docs

    npm run docs

This depends on gitbook. The 3.1.0 release should be installed, verify with:

    node_modules/.bin/gitbook ls

If not install it manually:

    node_modules/.bin/gitbook fetch 3.1.0

The versions get installed at ~/.gitbook/versions/

The doc build also requires that [ebook-convert](https://calibre-ebook.com) from Calibre is installed and on the path.

## Testing
    npm test

## Pre commit hook
In order to keep the full build (used by the QGIS Web Application Builder) up to date, install a pre commit hook in your local git repository (.git/hooks/pre-commit):

    #!/bin/sh
    npm test
    npm run build
    git add dist/js
    npm run docs
    git add docs
    npm run i18n
    git add locale/en.js

## npm run build
If you run into this error: Error: EMFILE, open 'sdk/node_modules/react/package.json' run the solution from here: https://github.com/andreypopp/react-app-express/issues/1#issuecomment-34113065

## Code Style

All components (js/components) should have the top level class `sdk-component`, as well as a class matching their name (in all lowercase, dash-delimited).

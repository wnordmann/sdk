# Boundless WebSDK

[![Travis CI Status](https://secure.travis-ci.org/boundlessgeo/sdk.svg)](http://travis-ci.org/#!/boundlessgeo/sdk)
[![Coverage Status](https://coveralls.io/repos/github/boundlessgeo/sdk/badge.svg?branch=master)](https://coveralls.io/github/boundlessgeo/sdk?branch=master)

Javascript SDK based on React, OpenLayers 3 and Flux.

For the user interface, [material-ui](http://www.material-ui.com/) is used.

For example usage see [the corresponding apps repository](https://github.com/boundlessgeo/sdk-apps)

For online docs see [HTML](https://boundlessgeo.github.io/sdk/book/index.html)

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

## npm run build
If you run into this error: Error: EMFILE, open 'sdk/node_modules/react/package.json' run the solution from here: https://github.com/andreypopp/react-app-express/issues/1#issuecomment-34113065

## Code Style

All components (js/components) should have the top level class `sdk-component`, as well as a class matching their name (in all lowercase, dash-delimited).

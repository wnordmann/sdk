# SDK
New javascript SDK based on React and Flux

    npm install
    npm start
    http://127.0.0.1:1337/themes/tabbed/index.html
    http://127.0.0.1:1337/themes/basic/index.html

To run the examples in production mode, append ?production to the url.

## Building css (Pivotal UI)

    npm run css

## Generating API docs

    npm run docs

## Testing
    npm test

## Pre commit hook
In order to keep the full build (used by the free version of QGIS Web Application Builder) up to date, install a pre commit hook in your local git repository (.git/hooks/pre-commit):

    #!/bin/sh
    npm run build:full
    npm run build:full:debug
    git add dist/js
    npm run css
    git add css
    npm run docs
    git add api

## npm run build
If you run into this error: Error: EMFILE, open 'sdk/node_modules/react/package.json' run the solution from here: https://github.com/andreypopp/react-app-express/issues/1#issuecomment-34113065

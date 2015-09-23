# sdk
New javascript SDK based on React and Flux

    npm install
    npm start
    http://127.0.0.1:1337/themes/tabbed/index.html
    http://127.0.0.1:1337/themes/basic/index.html

## Building css (Pivotal UI)

    npm run build-css

## Generating API docs

    npm install -g react-docgen
    cd js/components
    react-docgen . > ../../api/info.json

## npm run build
If you run into this error: Error: EMFILE, open 'sdk/node_modules/react/package.json' run the solution from here: https://github.com/andreypopp/react-app-express/issues/1#issuecomment-34113065

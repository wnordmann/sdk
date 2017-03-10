# Getting Started

## JSFiddle
Check out the following [JSFiddle example](https://jsfiddle.net/4uwjvcej/).

## Requirements for development environment
Make sure g++ is installed on your system.

## Node version manager (nvm)
Install the node version manager from https://github.com/creationix/nvm
For the SDK, you should be using node long-term support (LTS) so:

```
nvm install --lts
nvm use --lts
```

## Using the web-sdk application generator
The easiest way to get started is to use the web-sdk application generator.

### Installing the generator
Run the following command:

```
npm install -g boundless-web-sdk-generator
```

You can then run the web-sdk command like this:

```
web-sdk --help
```

This will output the usage instructions:

```
$ web-sdk --help

  Usage: web-sdk [options] [dir]

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -f, --force    force on non-empty directory
    -d, --debug    output more debug info
```

### Creating the application
Let's create our first application with the following command:

```
$ web-sdk ~/myapp

   create : ~/myapp
   create : ~/myapp/app.jsx
   create : ~/myapp/app.css
   create : ~/myapp/createbuild.js
   create : ~/myapp/createpackage.js
   create : ~/myapp/debug-server.js
   create : ~/myapp/index.html
   create : ~/myapp/proxy-config.json
   create : ~/myapp/package.json

   install dependencies:
     $ cd ~/myapp && npm install

   run the app:
     $ npm start
```

The application is generated and instructions are outputted on the next steps to undertake. Change to this directory and run (it is safe to ignore the WARNs):

```
npm install
```

This will install all the needed dependencies for the application.

We can now run the debug server with the following command:

```
npm start
```

This will start up a debug server on port 3000 by default:

```
$ npm start

> myapp@0.0.0 start ~/myapp
> npm-run-all createdir start:debug


> myapp@0.0.0 createdir ~/myapp
> node createbuild.js


> myapp@0.0.0 start:debug ~/myapp
> node debug-server.js

info serve-lib Parsing dependencies.
info serve-lib Debug server running http://localhost:3000/loader.js (Ctrl+C to stop)
```

If you want to run the debug server on a different port use:

```
$ npm start -- --port=5000
```

To create a zip file package for production use the following command:

```
$ npm run build
$ npm run createzip -- --output-file=/tmp/myapp.zip
```

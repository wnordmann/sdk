# Getting Started

## JSFiddle
Check out the following [JSFiddle example](https://jsfiddle.net/bartvde/4uwjvcej/).

## Requirements for development environment
Make sure g++ is installed on your system.

## Node version manager (nvm)
Install the node version manager from https://github.com/creationix/nvm
For the Web SDK, you should be using node 6.0.0 so:

```
nvm install 6.0.0
nvm use 6.0.0
```

## Using the web-sdk application generator
The easiest way to get started is to use the web-sdk application generator. We will also outline the manual steps at the end of this section for advanced users, but the preferred way is to use the application generator.


### Installing the generator
Run the following command:

```
npm install -g boundless-web-sdk-generator
```

To install the package globally might need ```sudo``` rights.

You can then run the web-sdk command like this:

```
web-sdk --help
```

If you have insufficient rights to install globally, install the package like this:

```
npm install boundless-web-sdk-generator
```

And run:

```
node_modules/.bin/web-sdk --help
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
Let's create our first application with the following command (when using a globally installed ```web-sdk``` you can simply use ```web-sdk ~/myapp```):

```
$ node_modules/.bin/web-sdk ~/myapp

   create : ~/myapp
   create : ~/myapp/app.jsx
   create : ~/myapp/app.css
   create : ~/myapp/createbuild.js
   create : ~/myapp/debug-server.js
   create : ~/myapp/index.html
   create : ~/myapp/package.json

   install dependencies:
     $ cd ~/myapp && npm install

   run the app:
     $ npm start
```

The application is generated and instructions are outputted on the next steps to undertake. Change to this directory and run:

```
npm install
```

This will install all the needed dependencies for the application.

We can now run the debug server with the following command:

```
npm start
```

This will start up a debug server on port 3000:

```
$ npm start

> myapp@0.0.0 start ~/myapp
> npm-run-all --parallel createdir start:debug


> myapp@0.0.0 createdir ~/myapp
> node createbuild.js


> myapp@0.0.0 start:debug ~/myapp
> node debug-server.js

info serve-lib Parsing dependencies.
info serve-lib Debug server running http://localhost:3000/loader.js (Ctrl+C to stop)
```

To create a zip file package for production use the following command:

```
$ npm run package
```

You will be prompted for a destination file path and file name for the zip file, for instance ```~/myapp.zip```.

## Using Boundless Web SDK from npm
The following packages are relevant for the Boundless Web SDK:

* ```boundless-sdk```, the main package containing the components 
* ```boundless-sdk-tools```, package containing debug server
* ```boundless-web-sdk-generator```, package containing CLI for creating apps

So to install them you will need to use:

```
npm install boundless-sdk
npm install boundless-sdk-tools
npm install boundless-web-sdk-generator
```

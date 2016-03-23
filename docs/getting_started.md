# Getting Started

## JSFiddle
Check out the following [JSFiddle example](https://jsfiddle.net/bartvde/69z2wepo/30192/).

## Requirements for development environment
Make sure g++ is installed on your system.

## Node version manager (nvm)
Install the node version manager from https://github.com/creationix/nvm
For the Web SDK, you should be using node 4.3.2 so:

```
nvm install 4.3.2
nvm use 4.3.2
```

## Using the web-sdk application generator
The easiest way to get started is to use the web-sdk application generator. We will also outline the manual steps at the end of this section for advanced users, but the preferred way is to use the application generator.


### Installing the generator
Run the following command:

```
npm install -g web-sdk-generator --registry https://repo.boundlessgeo.com/api/npm/npmall
```

To install the package globally might need ```sudo``` rights.

You can then run the web-sdk command like this:

```
web-sdk --help
```

If you have insufficient rights to install globally, install the package like this:

```
npm install web-sdk-generator --registry https://repo.boundlessgeo.com/api/npm/npmall
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
Let's create our first application with the following command (when using a globally installed ```web-sdk``` you can simply use ```web-sdk /tmp/myapp```):

```
$ node_modules/.bin/web-sdk /tmp/myapp

   create : /tmp/myapp
   create : /tmp/myapp/app.jsx
   create : /tmp/myapp/app.css
   create : /tmp/myapp/createbuild.js
   create : /tmp/myapp/debug-server.js
   create : /tmp/myapp/index.html
   create : /tmp/myapp/package.json

   install dependencies:
     $ cd /tmp/myapp && npm install --registry https://repo.boundlessgeo.com/api/npm/npmall

   run the app:
     $ npm start
```

The application is generated and instructions are outputted on the next steps to undertake. Change to this directory and run:

```
npm install --registry https://repo.boundlessgeo.com/api/npm/npmall
```

This will install all the needed dependencies for the application.

We can now run the debug server with the following command:

```
npm start
```

This will start up a debug server on port 3000:

```
$ npm start

> myapp@0.0.0 start /private/tmp/myapp
> npm-run-all --parallel createdir start:debug


> myapp@0.0.0 createdir /private/tmp/myapp
> node createbuild.js


> myapp@0.0.0 start:debug /private/tmp/myapp
> node debug-server.js

info serve-lib Parsing dependencies.
info serve-lib Debug server running http://localhost:3000/loader.js (Ctrl+C to stop)
```

To create a zip file package for production use the following command:

```
$ npm run package
```

You will be prompted for a destination file path and file name for the zip file, for instance ```/tmp/myapp.zip```.

## Using Boundless Web SDK from npm
The following packages are relevant for the Boundless Web SDK:

* ```boundless-sdk```, the main package containing the components 
* ```sdk-tools```, package containing debug server
* ```web-sdk-generator```, package containing CLI for creating apps

The packages are stored in our repo server at: https://repo.boundlessgeo.com/api/npm/npmall

So to install them you will need to use:

```
npm install boundless-sdk --registry https://repo.boundlessgeo.com/api/npm/npmall
npm install sdk-tools --registry https://repo.boundlessgeo.com/api/npm/npmall
npm install web-sdk-generator --registry https://repo.boundlessgeo.com/api/npm/npmall
```

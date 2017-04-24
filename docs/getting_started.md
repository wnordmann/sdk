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
npm install -g @boundlessgeo/sdk-generator
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

### Proxying a local GeoServer
This section will explain how to use the debug server in combination with a local GeoServer instance. This is only needed if for instance you add your local GeoServer to the list of sources for the Add Layer dialog, basically if you're using a component that needs to do an XHR (AJAX) request to GeoServer, such as GetCapabilities.

The file ```proxy-config.json``` contains the configuration for the proxy. The default configuration will proxy a GeoServer on port 8080, and will assume that the debug server of your application is running on port 3000. If this differs, adapt the configuration in ```proxy-config.json```.

The proxy server will run on port 4000 by default (you can adapt this in package.json). To start up the proxy do the following in two separate terminals:

first of all, start off the debug server like you would normally do:

```
$ npm start
```

then, start the proxy server with the following command:

```
$ npm run start:proxy
```

Then, in your browser, point to http://localhost:4000 instead of https://localhost:3000

In your application you will now be able to use a relative url for GeoServer, so ```/geoserver/ows```. When you deploy to production, you should create a war file with the ```createzip``` command and deploy it next to your GeoServer, or ensure your GeoServer has CORS headers enabled. Enabling CORS headers on your GeoServer will also mean the proxy is not needed in the debug server.

# Boundless SDK
![Logo](http://boundlessgeo.github.io/sdk/book/styles/boundless_sdk_horiz.svg)

[![Travis CI Status](https://secure.travis-ci.org/boundlessgeo/sdk.svg)](http://travis-ci.org/#!/boundlessgeo/sdk)
[![Coverage Status](https://coveralls.io/repos/github/boundlessgeo/sdk/badge.svg?branch=master)](https://coveralls.io/github/boundlessgeo/sdk?branch=master)

Javascript SDK based on React, OpenLayers and Flux.

For the user interface, [material-ui](http://www.material-ui.com/) is used.

For example usage see [the corresponding apps repository](https://github.com/boundlessgeo/sdk-apps) and the corresponding [demos](http://boundlessgeo.github.io/sdk-apps/index.html)

For online docs see [HTML](https://boundlessgeo.github.io/sdk/book/index.html)

## Docs
Do not browse the docs from the docs subdirectory in github, those are incomplete (a lot of files are generated). So either browse them online, run ```npm run docs``` to generate them locally or run ```npm run serve:gitbook``` which will run the docs on http://localhost:4000

## Node version manager (nvm)
Install the node version manager from https://github.com/creationix/nvm
For the SDK, you should be using node long-term support (LTS) so:

```
nvm install --lts
nvm use --lts
```

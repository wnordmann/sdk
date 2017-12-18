// __mocks__/fetch-jsonp.js
'use strict';

const fetchjsonp = jest.genMockFromModule('fetch-jsonp');

module.exports = function(url) {
  return fetch(url);
};

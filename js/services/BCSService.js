/*
 * Copyright 2015-present Boundless Spatial Inc., http://boundlessgeo.com
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

import util from '../util';
import URL from 'url-parse';

const url = 'http://api.dev.boundlessgeo.io/v1/basemaps/';

class BCSService {
  getTileServices(apiKey, callback) {
    util.doGET(url, function(xmlhttp) {
      var config = JSON.parse(xmlhttp.responseText);
      var results = [];
      for (var i = 0, ii = config.length; i < ii; i++) {
        var tileConfig = config[i];
        if (tileConfig.tileFormat == 'PNG' && tileConfig.standard == 'XYZ') {
          var urlObj = new URL(tileConfig.endpoint, true);
          urlObj.set('query', Object.assign(urlObj.query, {
            apikey: apiKey
          }));
          tileConfig.endpoint = urlObj.toString();
          if (!tileConfig.thumbnail) {
            tileConfig.thumbnail = tileConfig.endpoint.replace('{x}', '0').replace('{y}', '0').replace('{z}', '0').replace('{-y}', '0');
          }
          tileConfig.description = tileConfig.name;
          results.push(tileConfig);
        }
      }
      callback.call(this, results);
    }, function() {
      callback.call(this, []);
    });
  }
}

export default new BCSService();

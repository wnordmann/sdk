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

import moment from 'moment';

/**
 * A service that helps parse time dimension info from GetCapabilities
 */
class TimeService {
  readRange(subparts) {
    if (subparts.length < 2) {
      throw new Error('expected 2 parts for range : ' + subparts);
    }
    var start = subparts[0];
    var end = subparts[1];
    var duration;
    if (subparts.length == 3) {
      duration = subparts[2];
    }
    return {
      start: Date.parse(start),
      end: Date.parse(end),
      duration: moment.duration(duration).asMilliseconds()
    };
  }
  readPart(part) {
    var subparts = part.split('/');
    if (subparts.length == 1) {
      return Date.parse(subparts[0]);
    } else {
      return this.readRange(subparts);
    }
  }
  parse(dimension) {
    var dims = dimension.split(',');
    if (dims.length == 1) {
      var read = this.readPart(dims[0]);
      return typeof read === 'number' ? [read] : read;
    }
    return dims.map(this.readPart);
  }
}

export default new TimeService();

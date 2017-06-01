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

import Axios from 'axios';

const url = 'http://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=';// + value

// Sync Action
export const fetchGeocodeSuccess = (results, target) => {
  return {
    type: 'FETCH_GEOCODING_SUCCESS',
    results,
    target
  }
};
//Async Action
export const fetchGeocode = (searchValue, target) => {
  // Returns a dispatcher function
  // that dispatches an action at a later time
  return (dispatch) => {
    // Returns a promise
    return Axios.get(url + searchValue)
      .then(response => {
        // Dispatch another action to consume data
        dispatch(fetchGeocodeSuccess(response.data, target))
      })
      .catch(error => {
        throw (error);
      });
  };
};
export const geocodingSearch = (text) => {
  return {
    type: 'GEOCODING_SEARCH',
    text
  }
}

export const geocodingResults = (results) => {
  return {
    type : 'GEOCODING_RESULTS',
    results
  }
}
//TODO: Breaking location into lat/long/title/ect
export const geocodingSelect = (location) => {
  return {
    type : 'GEOCODING_SELECT',
    location
  }
}

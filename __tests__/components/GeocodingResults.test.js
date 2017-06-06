/* global afterEach, beforeEach, describe, it */

import React from 'react';
import ReactDOM from 'react-dom';
import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import intl from '../mock-i18n';
import {GeocodingResults} from '../../src/components/GeocodingResults';
import {BoundlessSdk} from '../../src/components/BoundlessSdk';
import * as geocodingActions from '../../src/actions/GeocodingActions';

raf.polyfill();

var mockSearchResults = [
    {
      'place_id': '171403811',
      'licence': 'Data © OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright',
      'osm_type': 'relation',
      'osm_id': '62607',
      'boundingbox': [
        '50.9378508',
        '53.0416917',
        '10.5608128',
        '13.1868819'
      ],
      'lat': '51.908526',
      'lon': '11.4939134',
      'display_name': 'Saxony-Anhalt, Germany',
      'class': 'boundary',
      'type': 'administrative',
      'importance': 0.67575017594291,
      'icon': 'http://nominatim.openstreetmap.org/images/mapicons/poi_boundary_administrative.p.20.png',
      'address': {
        'state': 'Saxony-Anhalt',
        'country': 'Germany',
        'country_code': 'de'
      }
    },
    {
      'place_id': '171509342',
      'licence': 'Data © OpenStreetMap contributors, ODbL 1.0. http://www.openstreetmap.org/copyright',
      'osm_type': 'relation',
      'osm_id': '535880',
      'boundingbox': [
        '-0.2135137',
        '1.9257601',
        '6.260642',
        '7.6704783'
      ],
      'lat': '0.8875498',
      'lon': '6.9648718',
      'display_name': 'São Tomé and Príncipe',
      'class': 'boundary',
      'type': 'administrative',
      'importance': 0.54573201539355,
      'icon': 'http://nominatim.openstreetmap.org/images/mapicons/poi_boundary_administrative.p.20.png',
      'address': {
        'country': 'São Tomé and Príncipe',
        'country_code': 'st'
      }
    }];

describe('GeocodingResults', function() {
  var target, map;
  var width = 360;
  var height = 180;

  beforeEach(function(done) {
    target = document.createElement('div');
    var style = target.style;
    style.position = 'absolute';
    style.left = '-1000px';
    style.top = '-1000px';
    style.width = width + 'px';
    style.height = height + 'px';
    document.body.appendChild(target);
    map = new ol.Map({
      target: target,
      view: new ol.View({
        center: [0, 0],
        zoom: 1
      })
    });
    map.once('postrender', function() {
      done();
    });
  });

  afterEach(function() {
    map.setTarget(null);
    document.body.removeChild(target);
  });


  it('creates a geocoding-results', function() {
    var container = document.createElement('div');
    ReactDOM.render((
      <BoundlessSdk map={map}>
        <GeocodingResults intl={intl} open={true}/>
      </BoundlessSdk>
    ), container);
    geocodingActions.fetchGeocodeSuccess(mockSearchResults, container)

    // var geocodingResults = container.querySelectorAll('.geocoding-results');
    // assert.equal(geocodingResults.length, 1);
    ReactDOM.unmountComponentAtNode(container);
  });

});

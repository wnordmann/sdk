/* global ol */
'use strict';

import React from 'react';
import LayerList from './components/LayerList.jsx';

var map = new ol.Map({
  layers: [
    new ol.layer.Tile({
      title: 'Streets',
      source: new ol.source.MapQuest({layer: 'osm'})
    }),
    new ol.layer.Tile({
      visible: false,
      title: 'Aerial',
      source: new ol.source.MapQuest({layer: 'sat'})
    }),
    new ol.layer.Vector({
      title: 'Zoning',
      style: new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'black',
          width: 4
        })
      }),
      source: new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        url: 'data/medford-zoning.json'
      })
    })
  ],
  target: 'map',
  view: new ol.View({
    center: ol.proj.fromLonLat([-122.85676399771559, 42.3389246879193]),
    zoom: 12
  })
});
/*jshint ignore:start */
React.render(<LayerList map={map} />,
  document.getElementById('layerlist'));
/*jshint ignore:end */

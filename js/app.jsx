/* global ol */
'use strict';

import React from 'react';
import LayerList from './components/LayerList.jsx';

var textStyleCache_airports = {}
var style_airports = function(feature, resolution) {

    var value = ""
    var style = [new ol.style.Style({
        image: new ol.style.Icon({
            scale: 0.025000,
            anchorOrigin: 'top-left',
            anchorXUnits: 'fraction',
            anchorYUnits: 'fraction',
            anchor: [0.5, 0.5],
            src: "data/styles/plane.svg"
        })
    })];
    var labelText = "";
    var key = value + "_" + labelText

    if (!textStyleCache_airports[key]) {
        var text = new ol.style.Text({
            font: '16.5px Calibri,sans-serif',
            text: labelText,
            fill: new ol.style.Fill({
                color: "rgba(0, 0, 0, 255)"
            }),
        });
        textStyleCache_airports[key] = new ol.style.Style({
            "text": text
        });
    }
    var allStyles = [textStyleCache_airports[key]];
    allStyles.push.apply(allStyles, style);
    return allStyles;
};

var textStyleCache_popp = {}
var clusterStyleCache_popp = {}
var style_popp = function(feature, resolution) {
    var size = feature.get('features').length;
    if (size != 1) {
        var style = clusterStyleCache_popp[size];
        if (!style) {
            style = [new ol.style.Style({
                image: new ol.style.Circle({
                    radius: 10,
                    stroke: new ol.style.Stroke({
                        color: '#fff'
                    }),
                    fill: new ol.style.Fill({
                        color: '#3399CC'
                    })
                }),
                text: new ol.style.Text({
                    text: size.toString(),
                    fill: new ol.style.Fill({
                        color: '#fff'
                    })
                })
            })];
            clusterStyleCache_popp[size] = style;
        }
        return style;
    }
    var value = ""
    var style = [new ol.style.Style({
        image: new ol.style.Circle({
            radius: 7.0,
            stroke: new ol.style.Stroke({
                color: 'rgba(0,0,0,255)',
                lineDash: null,
                width: 1
            }),
            fill: new ol.style.Fill({
                color: "rgba(255,255,255,1.0)"
            })
        })
    }), new ol.style.Style({
        image: new ol.style.Circle({
            radius: 1.0,
            stroke: new ol.style.Stroke({
                color: 'rgba(0,0,0,255)',
                lineDash: null,
                width: 1
            }),
            fill: new ol.style.Fill({
                color: "rgba(0,0,0,1.0)"
            })
        })
    })];
    var labelText = "";
    var key = value + "_" + labelText

    if (!textStyleCache_popp[key]) {
        var text = new ol.style.Text({
            font: '16.5px Calibri,sans-serif',
            text: labelText,
            fill: new ol.style.Fill({
                color: "rgba(0, 0, 0, 255)"
            }),
        });
        textStyleCache_popp[key] = new ol.style.Style({
            "text": text
        });
    }
    var allStyles = [textStyleCache_popp[key]];
    allStyles.push.apply(allStyles, style);
    return allStyles;
};

var map = new ol.Map({
  layers: [
    new ol.layer.Group({
      type: 'base',
      title: 'Base maps',
      layers: [
        new ol.layer.Tile({
          type: 'base',
          title: 'Streets',
          source: new ol.source.MapQuest({layer: 'osm'})
        }),
        new ol.layer.Tile({
          type: 'base',
          visible: false,
          title: 'Aerial',
          source: new ol.source.MapQuest({layer: 'sat'})
        })
      ]
    }),
    new ol.layer.Vector({
      title: 'popp',
      style: style_popp,
      source: new ol.source.Cluster({
        distance: 40.0,
        source: new ol.source.Vector({
          format: new ol.format.GeoJSON(),
          url: 'data/popp.json'
        })
      })
    }),
    new ol.layer.Vector({
      title: 'airports',
      style: style_airports,
      source: new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        url: 'data/airports.json'
      })
    })
  ],
  target: 'map',
  view: new ol.View({
    center: [-16839563.5993915, 8850169.509638],
    zoom: 4
  })
});
React.render(<LayerList showZoomTo="true" allowReordering="true" map={map} />,
  document.getElementById('layerlist'));

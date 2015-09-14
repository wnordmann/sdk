/* global ol */
import React from 'react';
import LayerList from './components/LayerList.jsx';
import Geocoding from './components/Geocoding.jsx';
import GeocodingResults from './components/GeocodingResults.jsx';
import Select from './components/Select.jsx';
import QueryBuilder from './components/QueryBuilder.jsx';
import FeatureTable from './components/FeatureTable.jsx';
import LayerActions from './actions/LayerActions.js';
import Chart from './components/Chart.jsx';
import UI from 'pui-react-buttons';
import Icon from 'pui-react-iconography';
import Bookmarks from './components/Bookmarks.jsx';
import Playback from './components/Playback.jsx';

var styleFires = new ol.style.Style({
  image: new ol.style.Icon({
    scale: 0.030000,
    anchorOrigin: 'top-left',
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    anchor: [0.5, 0.5],
    src: '../../data/styles/amenity=fire_station2321243910.svg',
    rotation: 0.000000
  })
});

var styleTrees = new ol.style.Style({
  fill: new ol.style.Fill({
    color: 'rgba(186,221,105,0.505882)'
  })
});

var textStyleCacheAirports = {};
var styleAirports = function() {
  var value = '';
  var style = [new ol.style.Style({
    image: new ol.style.Icon({
      scale: 0.025000,
      anchorOrigin: 'top-left',
      anchorXUnits: 'fraction',
      anchorYUnits: 'fraction',
      anchor: [0.5, 0.5],
      src: '../../data/styles/plane.svg'
    })
  })];
  var labelText = '';
  var key = value + '_' + labelText;
  if (!textStyleCacheAirports[key]) {
    var text = new ol.style.Text({
      font: '16.5px Calibri,sans-serif',
      text: labelText,
      fill: new ol.style.Fill({
        color: 'rgba(0, 0, 0, 255)'
      })
    });
    textStyleCacheAirports[key] = new ol.style.Style({
      'text': text
    });
  }
  var allStyles = [textStyleCacheAirports[key]];
  allStyles.push.apply(allStyles, style);
  return allStyles;
};

var textStyleCachePopp = {};
var clusterStyleCachePopp = {};
var stylePopp = function(feature) {
  var style;
  var size = feature.get('features').length;
  if (size !== 1) {
    style = clusterStyleCachePopp[size];
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
      clusterStyleCachePopp[size] = style;
    }
    return style;
  }
  var value = '';
  style = [new ol.style.Style({
    image: new ol.style.Circle({
      radius: 7.0,
      stroke: new ol.style.Stroke({
        color: 'rgba(0,0,0,255)',
        lineDash: null,
        width: 1
      }),
      fill: new ol.style.Fill({
        color: 'rgba(255,255,255,1.0)'
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
        color: 'rgba(0,0,0,1.0)'
      })
    })
  })];
  var labelText = '';
  var key = value + '_' + labelText;
  if (!textStyleCachePopp[key]) {
    var text = new ol.style.Text({
      font: '16.5px Calibri,sans-serif',
      text: labelText,
      fill: new ol.style.Fill({
        color: 'rgba(0, 0, 0, 255)'
      })
    });
    textStyleCachePopp[key] = new ol.style.Style({
      'text': text
    });
  }
  var allStyles = [textStyleCachePopp[key]];
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
      opacity: 1.0,
      source: new ol.source.Vector({
        url: '../../data/fires.json',
        format: new ol.format.GeoJSON()
      }),
      id: 'lyr00',
      timeInfo: {
        start: 'STARTDATED',
        end: 'OUTDATED'
      },
      style: styleFires,
      title: 'Fires',
      isSelectable: true
    }),
    new ol.layer.Vector({
      id: 'lyr01',
      isSelectable: true,
      title: 'trees',
      style: styleTrees,
      source: new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        url: '../../data/trees.json'
      })
    }),
    new ol.layer.Vector({
      id: 'lyr02',
      isSelectable: true,
      title: 'popp',
      style: stylePopp,
      source: new ol.source.Cluster({
        distance: 40.0,
        source: new ol.source.Vector({
          format: new ol.format.GeoJSON(),
          url: '../../data/popp.json'
        })
      })
    }),
    new ol.layer.Vector({
      title: 'airports',
      id: 'lyr03',
      isSelectable: true,
      style: styleAirports,
      source: new ol.source.Vector({
        format: new ol.format.GeoJSON(),
        url: '../../data/airports.json'
      })
    })
  ],
  target: 'map',
  view: new ol.View({
    center: [-13625367.7959, 6039995.37374],
    zoom: 7
  })
});

var selectedLayer = map.getLayers().item(2);
React.render(<Geocoding />, document.getElementById('geocoding'));
React.render(<GeocodingResults map={map} />, document.getElementById('geocoding-results'));
React.render(<LayerList showOpacity={true} showDownload={true} showGroupContent={true} showZoomTo={true} allowReordering={true} map={map} />,
  document.getElementById('layerlist'));
React.render(<Select toggleGroup='navigation' map={map}/>, document.getElementById('toolbar-select'));
React.render(<QueryBuilder map={map} />, document.getElementById('query-panel'));
React.render(<FeatureTable layer={selectedLayer} map={map} />, document.getElementById('table-panel'));
var charts = {'Airports count per use category': {'categoryField': 'USE', 'layer': 'lyr03', 'valueFields': [], 'displayMode': 2, 'operation': 2}, 'Forest area total surface': {'categoryField': 'VEGDESC', 'layer': 'lyr01', 'valueFields': ['AREA_KM2'], 'displayMode': 1, 'operation': 2}};
React.render(<Chart container='chart-panel' charts={charts} />, document.getElementById('toolbar-chart'));

var bookmarks = [{
  name: 'Le Grenier  Pain',
  description: '<br><b>Address: </b>38 rue des Abbesses<br><b>Telephone :</b>33 (0)1 46 06 41 81<br><a href=""http://www.legrenierapain.com"">Website</a>',
  extent: [259562.7661267497, 6254560.095662868, 260675.9610346824, 6256252.988234103]
}, {
  name: 'Poilne',
  description: '<br><b>Address: </b>8 rue du Cherche-Midi<br><b>Telephone :</b>33 (0)1 45 48 42 59<br><a href=""http://www.poilane.fr"">Website</a>',
  extent: [258703.71361629796, 6248811.5276565505, 259816.90852423065, 6250503.271278702]
}, {
  name: 'Pain d\'Epis',
  description: '<br><b>Address: </b>Pain d\'Epis<br><b>Telephone :</b>33 (0)1 45 51 75 01<br><a href=""#"">Website</a>',
  extent: [256033.93826860288, 6249647.883472723, 257147.1331765356, 6251339.794169339]
}, {
  name: 'Le Moulin de la Vierge',
  description: '<br><b>Address: </b>166 avenue de Suffren<br><b>Telephone :</b>33 (0)1 47 83 45 55<br><a href=""#"">Website</a>',
  extent: [256411.75662035524, 6248016.017431838, 257524.95152828796, 6249707.602166038]
}, {
  name: 'Maison Kayser',
  description: '<br><b>Address: </b>14 rue Monge<br><b>Telephone :</b>33 (0)1 44 07 17 81<br><a href=""http://www.maison-kayser.com/"">Website</a>',
  extent: [261005.24408844888, 6248428.056353206, 262118.4389963816, 6250119.723381014]
}, {
  name: 'Au 140',
  description: '<br><b>Address: </b>140 rue de Belleville<br><b>Telephone :</b>33 (0)1 46 36 92 47<br><a href=""http://www.davidlebovitz.com/2006/12/140/"">Website</a>',
  extent: [265468.710391296, 6252874.480301509, 266581.90529922873, 6254567.035831345]
}, {
  name: 'Le Notre',
  description: '<br><b>Address: </b>10 rue Saint Antoine<br><b>Telephone :</b>33 (0)1 53 01 91 91<br><a href=""http://www.lenotre.fr/fr/boulanger.php"">Website</a>',
  extent: [262926.7298190316, 6249251.010162451, 264039.9247269643, 6250942.841574115]
}];

React.render(<Bookmarks introTitle='Paris bakeries' introDescription='Explore the best bakeries of the capital of France' map={map} bookmarks={bookmarks} />, document.getElementById('bookmarks-panel'));

var navigationFunc = function() {
  LayerActions.activateTool(null, 'navigation');
};
React.render(<UI.DefaultButton title='Switch to map navigation (pan and zoom)' onClick={navigationFunc}>Navigation</UI.DefaultButton>, document.getElementById('toolbar-navigation'));

var toggle = function(el) {
  if (el.style.display === 'block') {
    el.style.display = 'none';
  } else {
    el.style.display = 'block';
  }
};

var queryFunc = function() {
  toggle(document.getElementById('query-panel'));
};

React.render(<UI.DefaultButton onClick={queryFunc}><Icon.Icon name="filter" /> Query</UI.DefaultButton>, document.getElementById('toolbar-query'));

var tableFunc = function() {
  toggle(document.getElementById('table-panel'));
};

React.render(<UI.DefaultButton onClick={tableFunc} title="Attributes table"><Icon.Icon name="list-alt" /> Table</UI.DefaultButton>, document.getElementById('toolbar-table'));

React.render(<Playback map={map} minDate={324511200000} maxDate={1385938800000} />, document.getElementById('timeline'));

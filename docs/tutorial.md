# Tutorial

## 1. Using the generator
In the getting started section we have learned how to create a skeleton application with the ```web-sdk``` command.

The skeleton application contains two base map layers, MapQuest streets and aerial, and a single widget, the ```LayerList``` widget.

The main file of the application is ```app.jsx```. Open up this file in your favorite text editor. Look for the definition of ```ol.Map```. The map gets defined with a layer group, that combines the MapQuest streets and aerial layers. The view is defined with an initial  center and zoom level. If you are not familiar with OpenLayers 3, the recommendation is to use the workshop at http://openlayers.org/workshop/ to get up to speed with OpenLayers 3.

## 2. Adding a vector layer from a GeoJSON file
Create a subdirectory called ```data``` in the root of the application directory, download USA states data as GeoJSON from: http://data.okfn.org/data/datasets/geo-boundaries-us-110m and save it to the ```data``` subdirectory.

```
mkdir data
curl "https://raw.githubusercontent.com/datasets/geo-boundaries-us-110m/master/json/ne_110m_admin_1_states_provinces_shp_scale_rank.geojson" -o data/ne_110m_admin_1_states_provinces_shp_scale_rank.geojson
```

Add the following layer definition in ```app.jsx``` after the existing ```ol.layer.Group```:

```javascript
  new ol.layer.Vector({
    id: 'states',
    title: 'USA States',
    source: new ol.source.Vector({
      url: 'data/ne_110m_admin_1_states_provinces_shp_scale_rank.geojson',
      format: new ol.format.GeoJSON()
    })
  })
```

And change the view's center so that the GeoJSON layer will be visible on start up:

```javascript
  view: new ol.View({
    center: [-10605790.55, 4363637.07],
    zoom: 4
  })
```

The full map definition should now look like:

```javascript
var map = new ol.Map({
  layers: [
    new ol.layer.Group({
      type: 'base-group',
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
      id: 'states',
      title: 'USA States',
      source: new ol.source.Vector({
        url: 'data/ne_110m_admin_1_states_provinces_shp_scale_rank.geojson',
        format: new ol.format.GeoJSON()
      })
    })
  ],
  view: new ol.View({
    center: [-10605790.55, 4363637.07],
    zoom: 4
  })
});
```

## 3. Adding a feature grid
In this step we'll learn how to add another component to the application, besides the LayerList component which is already in the application. First, we'll add an import statement at the top of ```app.jsx```:

```javascript
import FeatureTable from 'boundless-sdk/js/components/FeatureTable.jsx';
```

In the render function of our application, we need to add the definition of our new component, FeatureTable:

The feature table needs to get configured with at least a layer and a map:

```html
  <MapPanel id='map' className='row' map={map} />
  <div><LayerList map={map} /></div>
  <div id='zoom-buttons'><Zoom map={map} /></div>
  <div id='table' className='row'><FeatureTable resizeTo='table' map={map} layer={map.getLayers().item(1)} /></div>
```

Our div with id ```table``` does not yet have a size, so open up ```app.css``` and give it some space on the page:

```css
#map {
  height: 50%;
}
#table {
  height: 50%;
}
```

We have reduced the map div to 50% height and allocated the other 50% for the table.

If you reload the debug server at http://localhost:3000/ you'll see that we now have a feature table at the bottom of the page. With the ```resizeTo``` property we have told the FeatureTable to resize itself to the div with id ```table```.

When you click a row in the feature table, it will select the corresponding geometry in the map.

Our app.jsx will now  look like:

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import ol from 'openlayers';
import {addLocaleData, IntlProvider} from 'react-intl';
import Zoom from 'boundless-sdk/js/components/Zoom.jsx';
import MapPanel from 'boundless-sdk/js/components/MapPanel.jsx';
import FeatureTable from 'boundless-sdk/js/components/FeatureTable.jsx';
import LayerList from 'boundless-sdk/js/components/LayerList.jsx';
import injectTapEventPlugin from 'react-tap-event-plugin';
import enLocaleData from 'react-intl/locale-data/en.js';
import enMessages from 'boundless-sdk/locale/en.js';

// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

addLocaleData(
  enLocaleData
);

var map = new ol.Map({
  controls: [new ol.control.Attribution({collapsible: false})],
  layers: [
    new ol.layer.Group({
      type: 'base-group',
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
      id: 'states',
      title: 'USA States',
      source: new ol.source.Vector({
        url: 'data/ne_110m_admin_1_states_provinces_shp_scale_rank.geojson',
        format: new ol.format.GeoJSON()
      })
    })
  ],
  view: new ol.View({
    center: [-10605790.55, 4363637.07],
    zoom: 4
  })
});

class MyApp extends React.Component {
  render() {
    return (
       <div id='content'>
        <MapPanel id='map' className='row' map={map} />
        <div><LayerList map={map} /></div>
        <div id='zoom-buttons'><Zoom map={map} /></div>
        <div id='table' className='row'><FeatureTable resizeTo='table' map={map} layer={map.getLayers().item(1)} /></div>
      </div>
    );
  }
}

ReactDOM.render(<IntlProvider locale='en' messages={enMessages}><MyApp /></IntlProvider>, document.getElementById('main'));
```

Our app.css will look like:

```css
html, body {
  height: 100%;
  padding: 0;
  margin: 0;
}
/* Dead Simple Grid (c) 2015 Vladimir Agafonkin */
.row .row { margin:  0 -1.5em; }
.col      { padding: 0  0em; }

.row:after {
    content: "";
    clear: both;
    display: table;
}

@media only screen { .col {
    float: left;
    width: 100%;
    box-sizing: border-box;
}}
/* end Dead Simple Grid */
#map {
  height: 50%;
}
#table {
  height: 50%;
}
#content, #main {
  width: 100%;
  height: 100%;
}
#zoom-buttons {
  margin-left: 20px;
  position: absolute;
  top: 20px;
}
```

## 4. Adding an upload component
In this step we'll be adding a button to the application that will open up a dialog where the user can upload a vector file, such as a KML, GPX or GeoJSON file.

Again, we will start by adding an ```import``` statement to import our component (and the Toolbar to put the button into):

```javascript
import AddLayer from 'boundless-sdk/js/components/AddLayer.jsx';
import Toolbar from 'material-ui/lib/toolbar/toolbar';
```

In the ```render``` function of our application, we need to add a toolbar to accommodate for the button of the upload component:

```html
 <div id='content'>
   <Toolbar><AddLayer map={map} /></Toolbar>
   <MapPanel id='map' className='row' map={map} />
```

Open up app.css and take the 56px of the toolbar from the map's height, and move the zoom buttons 56px down. Also move the layer list button down.

```css
#map {
  height: calc(50% - 56px);
}
#zoom-buttons {
  margin-left: 20px;
  position: absolute;
  top: 76px;
}
div.layer-switcher {
  top: 4em;
}
```

The final app.jsx will look like:

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import ol from 'openlayers';
import {addLocaleData, IntlProvider} from 'react-intl';
import Zoom from 'boundless-sdk/js/components/Zoom.jsx';
import MapPanel from 'boundless-sdk/js/components/MapPanel.jsx';
import FeatureTable from 'boundless-sdk/js/components/FeatureTable.jsx';
import LayerList from 'boundless-sdk/js/components/LayerList.jsx';
import AddLayer from 'boundless-sdk/js/components/AddLayer.jsx';
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import injectTapEventPlugin from 'react-tap-event-plugin';
import enLocaleData from 'react-intl/locale-data/en.js';
import enMessages from 'boundless-sdk/locale/en.js';

// Needed for onTouchTap
// Can go away when react 1.0 release
// Check this repo:
// https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin();

addLocaleData(
  enLocaleData
);

var map = new ol.Map({
  controls: [new ol.control.Attribution({collapsible: false})],
  layers: [
    new ol.layer.Group({
      type: 'base-group',
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
      id: 'states',
      title: 'USA States',
      source: new ol.source.Vector({
        url: 'data/ne_110m_admin_1_states_provinces_shp_scale_rank.geojson',
        format: new ol.format.GeoJSON()
      })
    })
  ],
  view: new ol.View({
    center: [-10605790.55, 4363637.07],
    zoom: 4
  })
});

class MyApp extends React.Component {
  render() {
    return (
       <div id='content'>
        <Toolbar><AddLayer map={map} /></Toolbar>
        <MapPanel id='map' className='row' map={map} />
        <div><LayerList map={map} /></div>
        <div id='zoom-buttons'><Zoom map={map} /></div>
        <div id='table' className='row'><FeatureTable resizeTo='table' map={map} layer={map.getLayers().item(1)} /></div>
      </div>
    );
  }
}

ReactDOM.render(<IntlProvider locale='en' messages={enMessages}><MyApp /></IntlProvider>, document.getElementById('main'));
```

The final app.css will look like:

```css
html, body {
  height: 100%;
  padding: 0;
  margin: 0;
}
/* Dead Simple Grid (c) 2015 Vladimir Agafonkin */
.row .row { margin:  0 -1.5em; }
.col      { padding: 0  0em; }

.row:after {
    content: "";
    clear: both;
    display: table;
}

@media only screen { .col {
    float: left;
    width: 100%;
    box-sizing: border-box;
}}
/* end Dead Simple Grid */
#map {
  height: calc(50% - 56px);
}
#table {
  height: 50%;
}
#content, #main {
  width: 100%;
  height: 100%;
}
#zoom-buttons {
  margin-left: 20px;
  position: absolute;
  top: 76px;
}
div.layer-switcher {
  top: 4em;
}
```

The final application will look like: ![final tutorial application](tutorial.png).

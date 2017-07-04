import React from 'react';
import { shallow, mount, render } from 'enzyme';


import { Map } from '../../src/components/map';
import olMap from 'ol/map';
import TileLayer from 'ol/layer/tile';

import { createStore, combineReducers } from 'redux'
import ConnectedMap from '../../src/components/map';
import MapReducer from '../../src/reducers/map';

describe('Map component', () => {

  it('should render without throwing an error', function() {
    expect(shallow(<Map />).contains(<div className="map"></div>)).toBe(true);
  });

  it('should create a map', function() {
    const sources = {
      "osm": {
        "type": "raster",
        "attribution": "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors.",
        "tileSize": 256,
        "tiles": [
          "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
          "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
        ]
      },
      "states-wms": {
        "type": "raster",
        "tileSize": 256,
        "tiles": ["https://ahocevar.com/geoserver/gwc/service/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/png&SRS=EPSG:900913&LAYERS=topp:states&STYLES=&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}"]
      }
    };
    const layers = [{
      "id": "osm",
      "source": "osm"
    }, {
      "id": "states",
      "source": "states-wms",
    }];
    const center = [0, 0];
    const zoom = 2;
    const _sourcesVersion = 0, _layersVersion = 0;
    const wrapper = shallow(<Map map={{center, zoom, sources, layers, _sourcesVersion, _layersVersion}} />);
    wrapper.instance().componentDidMount();
    const map = wrapper.instance().map;
    expect(map).toBeDefined();
    expect(map).toBeInstanceOf(olMap);
    expect(map.getLayers().item(0)).toBeInstanceOf(TileLayer);

    // move the map.
    wrapper.setProps({
      zoom: 4
    });
  });

  it('should created a connected map', function() {
    const store = createStore(combineReducers({
      map: MapReducer,
    }));

    const wrapper = mount(<ConnectedMap store={store}/>);
  });

});

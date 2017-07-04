import React from 'react';
import { shallow, mount, render } from 'enzyme';

import { Map } from '../../src/components/map';
import olMap from 'ol/map';
import TileLayer from 'ol/layer/tile';

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
      }
    };
    const layers = [{
      "id": "osm",
      "source": "osm"
    }];
    const center = [0, 0];
    const zoom = 2;
    const wrapper = shallow(<Map map={{center, zoom, sources, layers}} />);
    wrapper.instance().componentDidMount();
    const map = wrapper.instance().map;
    expect(map).toBeDefined();
    expect(map).toBeInstanceOf(olMap);
    expect(map.getLayers().item(0)).toBeInstanceOf(TileLayer);
  });

});

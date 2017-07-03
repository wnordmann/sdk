import * as actions from '../../src/actions/map'
import { MAP } from '../../src/action-types';

describe('actions', () => {

  it('should create an action to set the view', () => {
    const center = [5, 5];
    const zoom = 10;
    const expectedAction = {
      type: MAP.SET_VIEW,
      view: {
        center,
        zoom
      }
    }
    expect(actions.setView(center, zoom)).toEqual(expectedAction)
  });

  it('should create an action to add a layer', () => {
    const layerDef = {
      "id": "osm",
      "source": "osm"
    };
    const expectedAction = {
      type: MAP.ADD_LAYER,
      layerDef
    }
    expect(actions.addLayer(layerDef)).toEqual(expectedAction)
  });

  it('should create an action to add a source', () => {
    const sourceName = 'osm';
    const sourceDef = {
      "type": "raster",
      "attribution": "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors.",
      "tileSize": 256,
      "tiles": [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
      ]
    };
    const expectedAction = {
      type: MAP.ADD_SOURCE,
      sourceName,
      sourceDef
    }
    expect(actions.addSource(sourceName, sourceDef)).toEqual(expectedAction)
  });

  it('should create an action to remove a layer', () => {
    const layerId = 'osm';
    const expectedAction = {
      type: MAP.REMOVE_LAYER,
      layerId
    }
    expect(actions.removeLayer(layerId)).toEqual(expectedAction)
  });

  it('should create an action to remove a source', () => {
    const sourceName = 'osm';
    const expectedAction = {
      type: MAP.REMOVE_SOURCE,
      sourceName
    }
    expect(actions.removeSource(sourceName)).toEqual(expectedAction)
  });

  it('should create an action to update a layer', () => {
    const layerId = 'osm';
    const layerDef = {
      "id": "osm",
      "source": "osm"
    };
    const expectedAction = {
      type: MAP.UPDATE_LAYER,
      layerId,
      layerDef
    }
    expect(actions.updateLayer(layerId, layerDef)).toEqual(expectedAction)
  });

  it('should create an action to add features', () => {
    const sourceName = 'tegola';
    const features = [{
      "type": "Feature",
      "geometry": {"type": "Point", "coordinates": [102.0, 0.5]},
      "properties": {"prop0": "value0"}
    }];
    const expectedAction = {
      type: MAP.ADD_FEATURES,
      sourceName,
      features
    }
    expect(actions.addFeatures(sourceName, features)).toEqual(expectedAction)
  });

  it('should create an action to set layer visibility', () => {
    const layerId = 'osm';
    const visibility = false;
    const expectedAction = {
      type: MAP.SET_LAYER_VISIBILITY,
      layerId,
      visibility
    }
    expect(actions.setLayerVisibility(layerId, visibility)).toEqual(expectedAction)
  });

})

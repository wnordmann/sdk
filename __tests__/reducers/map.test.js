import reducer from '../../src/reducers/map'
import {MAP} from '../../src/action-types'
import deepFreeze from 'deep-freeze';

describe('map reducer', () => {

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      version: 8,
      name: 'default',
      center: [0, 0],
      zoom: 3,
      _sourcesVersion: 0,
      sources: {},
      _layersVersion: 0,
      layers: []
    })
  })

  it('should handle ADD_LAYER', () => {
   const layer = {
     "id": "background",
     "type": "background",
     "paint": {
       "background-color": "rgba(0,0,0,0)"
      }
    };
    deepFreeze(layer);
    const action = {
      type: MAP.ADD_LAYER,
      layerDef: layer
    };
    deepFreeze(action);
    expect(
      reducer(undefined, action)
    ).toEqual({
      version: 8,
      name: 'default',
      center: [0, 0],
      zoom: 3,
      _sourcesVersion: 0,
      sources: {},
      _layersVersion: 1,
      layers: [{
        "id": "background",
        "type": "background",
        "paint": {
          "background-color": "rgba(0,0,0,0)"
        },
        "filter": null
      }]
    })
  })

  it('should handle SET_LAYER_VISIBILITY', () => {
   const layer = {
     "id": "background",
     "type": "background",
     "paint": {
       "background-color": "rgba(0,0,0,0)"
      }
    };
    deepFreeze(layer);
    const action = {
      type: MAP.SET_LAYER_VISIBILITY,
      id: 'background',
      visibility: 'none'
    };
    const state = {
      version: 8,
      name: 'default',
      center: [0, 0],
      zoom: 3,
      _sourcesVersion: 0,
      sources: {},
     _layersVersion: 0,
     layers: [layer]
    };
    deepFreeze(state);
    deepFreeze(action);
    expect(
      reducer(state, action)
    ).toEqual({
      version: 8,
      name: 'default',
      center: [0, 0],
      zoom: 3,
      _sourcesVersion: 0,
      sources: {},
      _layersVersion: 1,
      layers: [{
        "id": "background",
        "type": "background",
        "paint": {
          "background-color": "rgba(0,0,0,0)"
        },
        "layout": {
          "visibility": "none"
        }
      }]
    })
  })

  it('should handle REMOVE_LAYER', () => {
   const layer = {
     "id": "background",
     "type": "background",
     "paint": {
       "background-color": "rgba(0,0,0,0)"
      }
    };
    deepFreeze(layer);
    const action = {
      type: MAP.REMOVE_LAYER,
      layerId: 'background'
    };
    const state = {
      version: 8,
      name: 'default',
      center: [0, 0],
      zoom: 3,
      _sourcesVersion: 0,
      sources: {},
     _layersVersion: 0,
     layers: [layer]
    };
    deepFreeze(state);
    deepFreeze(action);
    expect(
      reducer(undefined, action)
    ).toEqual({
      version: 8,
      name: 'default',
      center: [0, 0],
      zoom: 3,
      _sourcesVersion: 0,
      sources: {},
      _layersVersion: 1,
      layers: []
    })
  })

  it('should handle UPDATE_LAYER', () => {
   const layer = {
     "id": "background",
     "type": "background",
     "paint": {
       "background-color": "rgba(0,0,0,0)"
      }
    };
    const newLayer = {
     "id": "background",
     "type": "background",
     "paint": {
       "background-color": "rgba(255,0,0,0)"
      }
    };
    deepFreeze(layer);
    deepFreeze(newLayer);
    const action = {
      type: MAP.UPDATE_LAYER,
      layerId: 'background',
      layerDef: newLayer
    };
    const state = {
      version: 8,
      name: 'default',
      center: [0, 0],
      zoom: 3,
      _sourcesVersion: 0,
      sources: {},
     _layersVersion: 0,
     layers: [layer]
    };
    deepFreeze(state);
    deepFreeze(action);
    expect(
      reducer(state, action)
    ).toEqual({
      version: 8,
      name: 'default',
      center: [0, 0],
      zoom: 3,
      _sourcesVersion: 0,
      sources: {},
      _layersVersion: 1,
      layers: [newLayer]
    })
  })

  it('should handle ADD_SOURCE', () => {
    const source = {
      "type": "raster",
      "attribution": "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors.",
      "tileSize": 256,
      "tiles": [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
      ]
    };
    deepFreeze(source);
    const action = {
      type: MAP.ADD_SOURCE,
      sourceName: 'osm',
      sourceDef: source
    };
    deepFreeze(action);
    expect(
      reducer(undefined, action)
    ).toEqual({
      version: 8,
      name: 'default',
      center: [0, 0],
      zoom: 3,
      _sourcesVersion: 1,
      sources: {
        'osm': source
      },
      _layersVersion: 0,
      layers: []
    })
  })

  it('should handle REMOVE_SOURCE', () => {
   const source = {
      "type": "raster",
      "attribution": "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors.",
      "tileSize": 256,
      "tiles": [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
      ]
    };
    deepFreeze(source);
    const action = {
      type: MAP.REMOVE_SOURCE,
      sourceName: 'osm'
    };
    const state = {
      version: 8,
      name: 'default',
      center: [0, 0],
      zoom: 3,
      _sourcesVersion: 0,
      sources: {
        'osm': source
      },
      _layersVersion: 0,
      layers: []
    };
    deepFreeze(state);
    deepFreeze(action);
    expect(
      reducer(undefined, action)
    ).toEqual({
      version: 8,
      name: 'default',
      center: [0, 0],
      zoom: 3,
      _sourcesVersion: 1,
      sources: {},
      _layersVersion: 0,
      layers: []
    })
  })

})

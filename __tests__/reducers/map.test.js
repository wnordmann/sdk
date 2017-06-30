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

})

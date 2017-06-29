import reducer from '../../src/reducers/map'
import {MAP} from '../../src/action-types'

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
    expect(
      reducer(undefined, {
        type: MAP.ADD_LAYER,
        layer: {
          "id": "background",
          "type": "background",
          "paint": {
            "background-color": "rgba(0,0,0,0)"
          }
        }
      })
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
})

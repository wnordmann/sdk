export default (state = [], action) => {
  switch (action.type) {
    case 'GET_MAP_LAYERS':
      return {
        ...state,
        mapLayers: action.mapLayers
      }
    case 'GET_MAP':
      return {
        ...state,
        map: action.map,
        layers: action.layers,
        view: action.view
      }
    default:
      return state
  }
}

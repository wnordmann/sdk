export default (state = [], action) => {
  switch (action.type) {
    case 'GET_MAP_LAYERS':
      return {
        ...state,
        mapLayers: action.mapLayers
      }
    default:
      return state
  }
}

export default (state = [], action) => {
  switch (action.type) {
    case 'REMOVE_LAYER':
      if (action.group) {
        return state;
      } else {
        return {
          ...state,
          flatLayers: state.flatLayers.filter(function(item) {
            return (item.id !== action.layer.get('id')) && (item.parentId !== action.layer.get('id'));
          }),
          layers: state.layers.filter(function(item) {
            return item.id !== action.layer.get('id');
          })
        };
      }
      break;
    default:
      return state
  }
}

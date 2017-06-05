export default (state = [], action) => {
  switch (action.type) {
    case 'GET_NUM_LAYERS':
      return {
        ...state,
        numlayers: action.numlayers
      }
    default:
      return state
  }
}

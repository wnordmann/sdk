export default (state = [], action) => {
  switch (action.type) {
    case 'GET_RESOLUTION':
      return {
        ...state,
        resolution: action.resolution
      }
    default:
      return state
  }
}

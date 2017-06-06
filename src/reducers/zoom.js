export default (state = [], action) => {
  switch (action.type) {
    case 'GET_DELTA':
      return {
        ...state,
        delta: action.delta
      }
    default:
      return state
  }
}

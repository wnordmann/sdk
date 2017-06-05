export default (state = [], action) => {
  switch (action.type) {
    case 'GET_RESOLUTION':
      return {
        ...state,
        resolutionValue: action.resolutionValue
      }
    default:
      return state
  }
}

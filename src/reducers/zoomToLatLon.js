const initialState = {dialogIsOpen: false}
export default (state = initialState, action) => {
  switch (action.type) {
    case 'OPEN_DIALOG':
      return {
        dialogIsOpen: true
      }
    case 'CLOSE_DIALOG':
      return {
        dialogIsOpen: false
      }
    default:
      return state
  }
}

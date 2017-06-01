export default (state = [], action) => {
  switch (action.type) {
    case 'BOOKMARK_SELECT':
      return {
        selectedBookmark: action.bookmark
      }
    default:
      return state
  }
}

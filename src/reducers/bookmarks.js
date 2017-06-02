export default (state = [], action) => {
  switch (action.type) {
    case 'BOOKMARK_SELECT':
      return {
        ...state,
        selectedBookmark: action.bookmark,
        selectedIndex: action.index
      }
    case 'GET_LAYERS':
      return {
        ...state,
        numLayers: action.numLayers
      }
    case 'GET_BOOKMARKS':
      return {
        ...state,
        numBookmarks: action.numBookmarks
      }
    default:
      return state
  }
}

export default (state = [], action) => {
  switch (action.type) {
    case 'GEOCODING_SEARCH':
      return {
        geocodingSearchString: action.text,
        showGeocodingResults:false
      }
    case 'GEOCODING_SELECT':
      return {
        ...state,
        showGeocodingResults:false
      }
    case 'GEOCODING_CLOSE':
      return {
        ...state,
        showGeocodingResults:false
      }
    case 'FETCH_GEOCODING_SUCCESS':
      return {
        ...state,
        geocodingSearchResults: action.results,
        geocodingTarget: action.target,
        showGeocodingResults:true
      }
    default:
      return state
  }
}

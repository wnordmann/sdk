export default (state = [], action) => {
  switch (action.type) {
    case 'GEOCODING_SEARCH':
      return {
        geocodingSearchString: action.text,
        searching:true,
        showGeocodingResults:false
      }
    case 'GEOCODING_SELECT':
      return {
        latitude:10,
        longitude:10
      }
    case 'FETCH_GEOCODING_SUCCESS':
      return {
        geocodingSearchResults: action.results,
        searching:false,
        showGeocodingResults:true
      }
    default:
      return state
  }
}

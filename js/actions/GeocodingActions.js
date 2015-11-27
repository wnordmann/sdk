import GeocodingConstants from '../constants/GeocodingConstants.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';

export default {
  showSearchResult: (results) => {
    AppDispatcher.handleAction({
      type: GeocodingConstants.SHOW_SEARCH_RESULTS,
      searchResults: results
    });
  }
};

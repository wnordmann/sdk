/** Demo of bookmarks zooming between points in an SDK map.
 *  Custom Open Layer Controls are added
 *
 */

import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';

import React from 'react';
import ReactDOM from 'react-dom';

import SdkMap from '@boundlessgeo/sdk/components/map';
import SdkMapReducer from '@boundlessgeo/sdk/reducers/map';
import * as mapActions from '@boundlessgeo/sdk/actions/map';

import BookmarkComponent from './bookmarks';
import bookmarkReducer from './reducer';
import * as bookmarkAction from './action';

import MoveButtonComponent from './moveButton';

// This will have webpack include all of the SDK styles.
import '@boundlessgeo/sdk/stylesheet/sdk.scss';

/* eslint-disable no-underscore-dangle */
const store = createStore(combineReducers({
  map: SdkMapReducer, bookmark: bookmarkReducer,
}), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
   applyMiddleware(thunkMiddleware));

function main() {
  // load in the map style from a external .json
  store.dispatch(mapActions.setContext({url:'./bookmarks.json'}));

  // This is the name of the source that the bookmark componet will iterate over
  const sources = ['paris-bakeries', 'saint-louis-bakeries'];
  store.dispatch(bookmarkAction.changeSource(sources[0]));

  const changeSource = () => {
    let source = sources[0];
    if(store.getState().bookmark.source === sources[0]){
      source = sources[1]
    }

    store.dispatch(bookmarkAction.changeSource(source));
  }

  // place the map on the page
  ReactDOM.render(<SdkMap className='map-container' store={store}/>,
    document.getElementById('map'));

  // place the bookmark control and pass in the features and zoom function
  ReactDOM.render(<BookmarkComponent className='bookmark-item' store={store}/>,
    document.getElementById('bookmark'));

  // place the move slide compoent, same slide used in bookmark component
  ReactDOM.render(
    (<div><button className="sdk-btn" onClick={ changeSource }  >Change Source</button><MoveButtonComponent className="sdk-btn" store={store}/></div>),
      document.getElementById('controls'));
}
main();

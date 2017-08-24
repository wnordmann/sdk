/* global it, describe, expect */

import React from 'react';
import { mount } from 'enzyme';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';

import ConnectedMap from '../../src/components/map';
import MapReducer from '../../src/reducers/map';
import MapControlReducer from '../../src/reducers/mapControl';
import * as controlActions from '../../src/actions/mapControl';


describe('Map component custom control', () => {
  it('should add in a new controls', () => {
    const store = createStore(combineReducers({
      map: MapReducer, mapControl: MapControlReducer,
    }), applyMiddleware(thunkMiddleware));

    const wrapper = mount(<ConnectedMap store={store} />);
    const map = wrapper.instance().getWrappedInstance();

    const controlObjText = {
      name:'testText',
      innerHtmlElement: 'span',
      innerElementClass: 'interior',
      outerHtmlElement: 'span',
      outerElementClass: 'modal-window',
      text: 'test',
    };
    store.dispatch(controlActions.addControl(controlObjText));

    const controlObjHtml = {
      name:'testHtml',
      innerHtmlElement: 'div',
      innerElementClass: 'interior',
      outerHtmlElement: 'div',
      outerElementClass: 'modal-window',
      html: '<div class="pretty">Pretty</div>',
    };
    store.dispatch(controlActions.addControl(controlObjHtml));

    const mapControls = map.map.getControls().getArray();
    expect(mapControls[3].element instanceof HTMLSpanElement).toBeTruthy();

    expect(wrapper.html().indexOf('modal-window')).toBeGreaterThan(0);
    expect(wrapper.html().indexOf('interior')).toBeGreaterThan(0);
    expect(wrapper.html().indexOf('pretty')).toBeGreaterThan(0);
    expect(mapControls[4].element instanceof HTMLDivElement).toBeTruthy();
  });
});

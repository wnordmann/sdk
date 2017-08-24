/* global it, describe, expect */

import React from 'react';
import { mount } from 'enzyme';

import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';

import ConnectedMap from '../../src/components/map';
import MapReducer from '../../src/reducers/map';
import MapControlReducer from '../../src/reducers/mapControl';
import * as controlActions from '../../src/actions/mapControl';

const controlObj = {
  name:'testHtml',
  innerHtmlElement: 'div',
  innerElementClass: 'interior',
  outerHtmlElement: 'div',
  outerElementClass: 'modal-window',
  html: '<div class="testStyle">Test</div>',
};

describe('Map component custom control', () => {
  it('should add in a new controls with text and div', () => {
    const store = createStore(combineReducers({
      map: MapReducer, mapControl: MapControlReducer,
    }), applyMiddleware(thunkMiddleware));

    const wrapper = mount(<ConnectedMap store={store} />);
    const map = wrapper.instance().getWrappedInstance();

    // Get collection of controls
    let mapControls = map.map.getControls().getArray();

    // Check for classes defined in controlObj to be missing
    expect(wrapper.html().indexOf('modal-window')).toBeLessThan(0);
    expect(wrapper.html().indexOf('interior')).toBeLessThan(0);

    // Map starts with 3 controls
    expect(mapControls.length).toBe(3);

    // Add in a control
    store.dispatch(controlActions.addControl(controlObj));

    // Get collection of controls
    mapControls = map.map.getControls().getArray();

    // Now have 4 controls
    expect(mapControls.length).toBe(4);

    // Index 3 should be a DIV element as defined in controlObj
    expect(mapControls[3].element instanceof HTMLDivElement).toBeTruthy();

    // Check for classes defined in controlObj to be present
    expect(wrapper.html().indexOf('modal-window')).toBeGreaterThan(0);
    expect(wrapper.html().indexOf('interior')).toBeGreaterThan(0);
  });
  it('should add in a new controls with out text or html', () => {
    const store = createStore(combineReducers({
      map: MapReducer, mapControl: MapControlReducer,
    }), applyMiddleware(thunkMiddleware));

    const wrapper = mount(<ConnectedMap store={store} />);
    const map = wrapper.instance().getWrappedInstance();

    const removingHtmlAndText = {
      html: null,
      text: null,
    }

    // Add in a control
    store.dispatch(controlActions.addControl(Object.assign({}, controlObj, removingHtmlAndText)));

    // Get collection of controls
    const mapControls = map.map.getControls().getArray();

    // Now have 4 controls
    expect(mapControls.length).toBe(4);

    // Index 3 should be a DIV element as defined in controlObj
    expect(mapControls[3].element instanceof HTMLDivElement).toBeTruthy();

    // Check for classes defined in controlObj to be present
    expect(wrapper.html().indexOf('modal-window')).toBeGreaterThan(0);
    expect(wrapper.html().indexOf('interior')).toBeGreaterThan(0);
  });
  it('should add in a new controls with html and div', () => {
    const store = createStore(combineReducers({
      map: MapReducer, mapControl: MapControlReducer,
    }), applyMiddleware(thunkMiddleware));

    const wrapper = mount(<ConnectedMap store={store} />);
    const map = wrapper.instance().getWrappedInstance();

    // Edits to be applied to the control
    const controlObjEdit = {
      innerHtmlElement: 'span',
      outerHtmlElement: 'span',
      html: '<div class="testStyle">Test</div>',
      text: null
    }
    // Before new control there in no testStyle
    expect(wrapper.html().indexOf('testStyle')).toBeLessThan(0);

    // Add control with span and html
    store.dispatch(controlActions.addControl(Object.assign({}, controlObj, controlObjEdit)));

    const mapControls = map.map.getControls().getArray();

    // style from control html should be present
    expect(wrapper.html().indexOf('testStyle')).toBeGreaterThan(0);

    // Index 3 should be a DIV element as defined in controlObjEdit
    expect(mapControls[3].element instanceof HTMLSpanElement).toBeTruthy();
  });
  it('should add handle multiple controls', () => {
    const store = createStore(combineReducers({
      map: MapReducer, mapControl: MapControlReducer,
    }), applyMiddleware(thunkMiddleware));

    const wrapper = mount(<ConnectedMap store={store} />);
    const map = wrapper.instance().getWrappedInstance();

    let mapControls = map.map.getControls().getArray();

    // Map starts with 3 default controls from Open Layers
    expect(mapControls.length).toBe(3);

    // Add and 4th control
    store.dispatch(controlActions.addControl(controlObj));
    mapControls = map.map.getControls().getArray();
    expect(mapControls.length).toBe(4);

    // Add control with same name and new class getting same count
    store.dispatch(controlActions.addControl(Object.assign({}, controlObj, {innerElementClass:'test'})));
    mapControls = map.map.getControls().getArray();
    expect(mapControls.length).toBe(4);

    // Add control with new name and same class getting new count
    store.dispatch(controlActions.addControl(Object.assign({}, controlObj, {name:'test'})));
    mapControls = map.map.getControls().getArray();
    expect(mapControls.length).toBe(5);
  });
});

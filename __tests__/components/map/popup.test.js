/* global it, describe, expect, spyOn */

import React from 'react';
import {shallow, configure} from 'enzyme';
import  Adapter from 'enzyme-adapter-react-16';

import SdkPopup from '../../../src/components/map/popup';

configure({adapter: new Adapter()});

describe('Popup component', () => {
  it('should close', () => {
    const wrapper = shallow(<SdkPopup coordinate={[0, 0]} closeable><div>foo</div></SdkPopup>);
    const popup = wrapper.instance();
    wrapper.find('.sdk-popup-closer').simulate('click');
    expect(popup.state.closed).toBe(true);
  });

  it('should call stopPropagation if called with event', () => {
    const wrapper = shallow(<SdkPopup coordinate={[0, 0]} closeable><div>foo</div></SdkPopup>);
    const popup = wrapper.instance();
    const evt = {
      stopPropagation: () => {}
    };
    spyOn(evt, 'stopPropagation');
    popup.close(evt);
    expect(evt.stopPropagation).toHaveBeenCalled();
  });

  it('should allow for custom className', () => {
    const wrapper = shallow(<SdkPopup coordinate={[0, 0]} className='foo'><div>bar</div></SdkPopup>);
    expect(wrapper.find('.foo').length).toBe(1);
  });
});

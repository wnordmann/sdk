/*
 * Copyright 2015-present Boundless Spatial Inc., http://boundlessgeo.com
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

import React from 'react';
import {injectIntl} from 'react-intl';

class Dots extends React.Component {
  render() {
    var self = this;
    var indexes = getIndexes(self.props.slideCount, self.props.slidesToScroll);
    function getIndexes(count, inc) {
      var arr = [];
      for (var i = 0; i < count; i += inc) {
        arr.push(i);
      }
      return arr;
    }
    function getListStyles() {
      return {position: 'relative', margin: 0, padding: 0, top: '38px',  display: 'flex'};
    }
    function getListItemStyles() {
      return {listStyleType: 'none'};
    }
    function getButtonStyles(active) {
      return {
        border: 0,
        background: 'transparent',
        color: 'black',
        cursor: 'pointer',
        padding: 10,
        outline: 0,
        fontSize: 24,
        opacity: active ? 1 : 0.5
      };
    }
    return (
      <ul style = {getListStyles()} className='sdk-component bookmark-dots'>
        {indexes.map(function(index) {
          return (
            <li style = {getListItemStyles()} key = {index} >
              <button
                id={'dots_' + index}
                style = {getButtonStyles(self.props.currentSlide === index)}
                onClick = {self.props.goToSlide.bind(null, index)}>
                  &bull;
              </button>
            </li>
          )
        })}
      </ul>
    );
  }
}
export default injectIntl(Dots);

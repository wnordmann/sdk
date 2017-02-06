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

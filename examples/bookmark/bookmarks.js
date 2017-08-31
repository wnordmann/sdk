import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import bookmarkReducer from './reducer';
import MoveButtonComponent from './moveButton';
import * as bookmarkAction from './action';

// Custom Bookmark Component
class BookmarkComponent extends React.PureComponent{
  constructor(){
    super();
    // Using state local to the component instead of the redux store
    const count = 0;
    const featureCount = 0;
    const feature = {
      properties:{
        title:'',
        randomName:'',
        id:0
      },
      geometry:{
        coordinates :[0,0]
      }
    };
    this.state = {featureCount};
  }
  render() {
    // Get the feature selected by the count in state
    // Render the modal window using style from app.css
    const count = this.props.bookmark.count;
    const feature = this.props.map.sources["points"].data.features[count];
    return (
      <div className='modal-window'>
        <div className='interior'>
          <header>{feature.properties.title}</header>
            Name: {feature.properties.randomName} <br/>
            Latitude: <span className='coords'>{feature.geometry.coordinates[1]}</span> <br/>
            Longitude: <span className='coords'>{feature.geometry.coordinates[0]}</span> <br/>
        </div>
        <MoveButtonComponent store={this.props.store}/>
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    bookmark: state.bookmark,
    map: state.map,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    moveSlide: (count) => {
      dispatch(bookmarkAction.moveSlide(count));
    }
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(BookmarkComponent);

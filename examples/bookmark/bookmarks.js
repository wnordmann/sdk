import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import bookmarkReducer from './reducer';
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
  // This is the where action really happens, update state and move the map
  moveBookmark(count){
    this.props.moveSlide(count);
    const feature = this.props.map.sources["points"].data.features[count];
    this.props.zoomFunction(feature.geometry.coordinates);
  }
  nextBookmark(){
    const stateCount = this.props.bookmark.count;
    const newCount  = stateCount >= this.checkFeatureCount() - 1 ? 0 : stateCount + 1;
    this.moveBookmark(newCount);
  }
  previousBookmark(){
    const stateCount = this.props.bookmark.count;
    const newCount = stateCount <= 0 ? this.checkFeatureCount() - 1 : stateCount - 1;
    this.moveBookmark(newCount);
  }
  checkFeatureCount(){
    const featureCount = this.props.map.sources["points"].data.features.length;
    const stateCount = this.props.bookmark.count
    if(stateCount !== featureCount){
      this.setState({featureCount});
    }
    return featureCount;
  }
  componentWillReceiveProps(nextProps){
      console.log('change');
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
          <button  onClick={() => { this.previousBookmark() }}  >Previous</button><button onClick={() => {this.nextBookmark()}}>Next</button>
        </div>
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

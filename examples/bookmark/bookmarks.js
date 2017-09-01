import React from 'react';
import { connect } from 'react-redux';

import MoveButtonComponent from './moveButton';

// Custom Bookmark Component
class BookmarkComponent extends React.PureComponent{
  render() {
    // Get the feature selected by the count in state
    // Render the modal window using style from app.css
    const count = this.props.count
    if (Object.keys(this.props.map.sources).length > 0) {
      const feature = this.props.map.sources[this.props.bookmarkSource].data.features[count];
      return (
        <div className='modal-window'>
          <div className='interior'>
            <header>{feature.properties.title}</header>
              Address: {feature.properties.address} <br/>
              Phone: {feature.properties.telephone} <br/>
              <a href={feature.properties.website}> Web Site</a> <br/>
              <span className='coords'>{feature.geometry.coordinates[1]}</span>,
              <span className='coords'>{feature.geometry.coordinates[0]}</span> <br/>
              <br/>
          </div>
          <MoveButtonComponent store={this.props.store} bookmarkSource={this.props.bookmarkSource}/>
        </div>
      )
    } else {
      return (
        <div className='modal-window'>
          <div className='interior'>
          </div>
          <MoveButtonComponent store={this.props.store}/>
        </div>
      )
    }
  }
}
// Getting the bookmark.count and map stores
function mapStateToProps(state) {
  return {
    count: state.bookmark.count,
    map: state.map,
  };
}

export default connect(mapStateToProps, null)(BookmarkComponent);

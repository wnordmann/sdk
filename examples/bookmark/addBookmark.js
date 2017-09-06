import React from 'react';
import { connect } from 'react-redux';

import * as bookmarkAction from './action';
import * as mapActions from '@boundlessgeo/sdk/actions/map';

// Custom Bookmark Component
class addBookmarkComponenet extends React.PureComponent{
	constructor(props) {
    super(props);
    this.state = {
			name: '',
			address: '',
			phone: '',
			website: '',
			lat: '',
			long: ''
		};

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  save() {
		console.log(this.props.bookmark.source);
		const feature = {
			type:'Feature',
			properties:{
				name:this.state.name,
				address:this.state.address,
				telephone:this.state.phone,
				website:this.state.website
			},
			geometry: {
				type:'Point',
				coordinates : [this.state.long, this.state.lat]
			}
		}
		console.log(feature);
		this.props.addFeature(this.props.bookmark.source, feature);

  }

  render() {
      return (
        <div className='modal-window'>
          <div className='interior'>
					<div className="bookmarkItem">
		         <label>Name:
		           <input type="text" name='name' value={this.state.name} onChange={this.handleChange} />
		         </label>
		         <label>Address:
		           <input type="text" name='address' value={this.state.address} onChange={this.handleChange} />
		         </label>
		         <label>Phone:
		           <input type="number" name='phone' value={this.state.phone} onChange={this.handleChange} />
		         </label>
		         <label>Web Site:
		           <input type="text" name='website' value={this.state.website} onChange={this.handleChange} />
		         </label>
		         <label>Lat:
		           <input type="number" name='lat' value={this.state.lat} onChange={this.handleChange} />
		         </label>
		         <label>Long:
		           <input type="number" name='long' value={this.state.long} onChange={this.handleChange} />
		         </label>
		         <button className="sdk-btn" onClick={() => {this.save()}} >Save</button>
					</div>
				</div>
      </div>
      )
  }
}
// Getting the bookmark and map stores
function mapStateToProps(state) {
  return {
    bookmark: state.bookmark,
    map: state.map,
  };
}
function mapDispatchToProps(dispatch) {
  return {
		addFeature: (sourceName, features) => {
			dispatch(mapActions.addFeatures(sourceName, features));
		}
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(addBookmarkComponenet);

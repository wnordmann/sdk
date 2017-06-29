/** Provide an OpenLayers map which reflects the
 *  state of the  store.
 */

import React from 'react';

import { connect } from 'react-redux';

import { setView } from '../actions/map';

import olMap from 'ol/map';
import View from 'ol/view';

import TileLayer from 'ol/layer/tile';
import OsmSource from 'ol/source/osm';

class Map extends React.Component {

  /** Initialize the map */
  configureMap() {
    this.map = new olMap({
      layers: [
        new TileLayer({source: new OsmSource()}),
      ],
      target: this.refs.mapdiv,
      view: new View({
        center: this.props.map.center,
        zoom: this.props.map.zoom,
      })
    });

    // when the map moves update the location in the state
    this.map.on('moveend', (evt) => {
      this.props.setView(this.map.getView());
    });
  }

  componentDidMount() {
    console.log('mounted');
    // put the map into the DOM
    this.configureMap();
  }

  /** This will check nextProps and nextState to see
   *  what needs to be updated on the map.
   */
  shouldComponentUpdate(nextProps, nextState) {
    // compare the centers
    if(nextProps.map.center[0] !== this.props.map.center[0]
      || nextProps.map.center[1] !== this.props.map.center[1]
      || nextProps.map.zoom !== this.props.zoom) {

      this.map.getView().setCenter(nextProps.map.center);
      this.map.getView().setZoom(nextProps.map.zoom);
    }

    // This should always return false to keep
    // render() from being called.
    return false;
  }

  render() {
    return (
      <div ref="mapdiv" className="map">
      </div>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    map: state.map
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setView: (view) => {
      dispatch(setView(view.getCenter(), view.getZoom()));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);

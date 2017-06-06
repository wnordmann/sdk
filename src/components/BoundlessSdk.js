import React from 'react';
import {Provider} from 'react-redux';
import ol from 'openlayers';

import configureStore from '../stores/GeocodingStore';

const store = configureStore();

export class BoundlessSdk extends React.Component {
  static propTypes = {
    /**
     * @ignore
     */
    children: React.PropTypes.node,
    /**
     * OpenLayers Map
     */
    map: React.PropTypes.instanceOf(ol.Map).isRequired
  }
  constructor(props) {
    super(props);
  }
  getChildContext() {
    return {
      map: this.props.map
    };
  }
  render() {
    return (
      <Provider store={store}>
        {this.props.children}
      </Provider>
    );
  }

}
BoundlessSdk.childContextTypes = {
  map: React.PropTypes.instanceOf(ol.Map)
}
export default BoundlessSdk;

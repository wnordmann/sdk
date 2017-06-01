import React from 'react';
import {Provider} from 'react-redux';

import configureStore from '../stores/GeocodingStore';

const store = configureStore();

class BoundlessSdk extends React.Component {
  static propTypes = {
    /**
     * @ignore
     */
    children: React.PropTypes.node
  }
  // getChildContext() {
  //   return {
  //     map: this.props.map
  //   };
  // }
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Provider store={store}>
        {this.props.children}
      </Provider>
    );
  }
}
export default BoundlessSdk;

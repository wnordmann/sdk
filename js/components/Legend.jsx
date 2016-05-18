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
import ol from 'openlayers';
import LayerStore from '../stores/LayerStore.js';
import pureRender from 'pure-render-decorator';
import LegendItem from './LegendItem.jsx';
import List from 'material-ui/lib/lists/list';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

const messages = defineMessages({
  header: {
    id: 'legend.header',
    description: 'Header for the legend component',
    defaultMessage: 'Legend'
  }
});

/**
 * Legend component that can show legend graphic for multiple layer and source types dynamically.
 */
@pureRender
class Legend extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      flatLayers: []
    };
    LayerStore.bindMap(this.props.map);
  }
  componentWillMount() {
    this._onChangeCb = this._onChange.bind(this);
    LayerStore.addChangeListener(this._onChangeCb);
    this._onChange();
  }
  componentWillUnmount() {
    LayerStore.removeChangeListener(this._onChangeCb);
  }
  _onChange() {
    // TODO apply nesting to this component's structure
    var flatLayers = LayerStore.getState().flatLayers.slice();
    this.setState({flatLayers: flatLayers});
  }
  render() {
    const {formatMessage} = this.props.intl;
    var legends = this.state.flatLayers.map(function(layer) {
      return (<LegendItem key={layer.get('id')} layer={layer} />);
    });
    return <List subheader={formatMessage(messages.header)}>{legends}</List>;
  }
}

Legend.propTypes = {
  /**
   * The map whose layers should show up in this legend component.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(Legend);

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
import Table from 'material-ui/lib/table/table';
import TableHeaderColumn from 'material-ui/lib/table/table-header-column';
import TableRow from 'material-ui/lib/table/table-row';
import TableHeader from 'material-ui/lib/table/table-header';
import TableRowColumn from 'material-ui/lib/table/table-row-column';
import TableBody from 'material-ui/lib/table/table-body';
import FeatureStore from '../stores/FeatureStore.js';
import LayerSelector from './LayerSelector.jsx';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';
import classNames from 'classnames';

@pureRender
class FeatureTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      layer: this.props.layer ? this.props.layer : null
    };
  }
  _onLayerSelectChange(layer) {
    this.setState({layer: layer});
  }
  _filterLayerList(lyr) {
    return lyr.get('title') !== null && (lyr instanceof ol.layer.Vector || lyr.get('wfsInfo') !== undefined);
  }
  render() {
    const {formatMessage} = this.props.intl;
    var schema, key, id, columnNodes = [], rows = [];
    if (this.state.layer) {
      schema = FeatureStore.getSchema(this.state.layer);
      id = this.state.layer.get('id');
      var fsState = FeatureStore.getState(this.state.layer);
      var features = fsState ? fsState.features : [];
      for (key in schema) {
        columnNodes.push(<TableHeaderColumn key={key}>{key}</TableHeaderColumn>);
      }
      for (var i = 0, ii = features.length; i < ii; ++i) {
        var cells = [];
        for (key in schema) {
          cells.push(<TableRowColumn key={key + '-' + i}>{features[i].get(key)}</TableRowColumn>);
        }
        rows.push(<TableRow key={i}>{cells}</TableRow>);
      }
    }
    return (
      <div className={classNames('sdk-component feature-table', this.props.className)}>
        <div ref='form'>
          <div className='feature-table-options'>
            <div className='feature-table-selector'>
              <LayerSelector {...this.props} filter={this._filterLayerList} id='table-layerSelector' ref='layerSelector' onChange={this._onLayerSelectChange.bind(this)} map={this.props.map} value={id} />
            </div>
          </div>
        </div>
        <Table className='feature-table-table'>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
            <TableRow>
              {columnNodes}
            </TableRow>
          </TableHeader>
          <TableBody displayRowCheckbox={false} multiSelectable={true} preScanRows={false}>
            {rows}
          </TableBody>
        </Table>
      </div>);
  }
}

FeatureTable.propTypes = {
  /**
   * The ol3 map in which the source for the table resides.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * The layer to use initially for loading the table.
   */
  layer: React.PropTypes.instanceOf(ol.layer.Vector),
  /**
   * Css class name to apply on the root element of this component.
   */
  className: React.PropTypes.string,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(FeatureTable, {withRef: true}); // withRef needed so apps can call setDimensionsOnState

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
import ReactDOM from 'react-dom';
import ol from 'openlayers';
import LayerSelector from './LayerSelector.jsx';
import SelectActions from '../actions/SelectActions.js';
import filtrex from 'filtrex';
import UI from 'pui-react-buttons';
import Grids from 'pui-react-grids';
import './QueryBuilder.css';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';

const messages = defineMessages({
  layerlabel: {
    id: 'querybuilder.layerlabel',
    description: 'Label for the layer combo box',
    defaultMessage: 'Layer'
  },
  filterlabel: {
    id: 'querybuilder.filterlabel',
    description: 'Label for the filter expression input field',
    defaultMessage: 'Filter'
  },
  filterbuttontext: {
    id: 'querybuilder.filterbuttontext',
    description: 'Text for the filter button',
    defaultMessage: 'Selected items based on your criteria'
  },
  filterplaceholder: {
    id: 'querybuilder.filterplaceholder',
    description: 'Placeholder for the expression input field',
    defaultMessage: 'Type expression ....'
  },
  filterhelptext: {
    id: 'querybuilder.filterhelptext',
    description: 'filter help text',
    defaultMessage: 'ATTRIBUTE == "Value"'
  },
  newbuttontitle: {
    id: 'querybuilder.newbuttontitle',
    description: 'Title for the new selection button',
    defaultMessage: 'New selection'
  },
  newbuttontext: {
    id: 'querybuilder.newbuttontext',
    description: 'Text for the new selection button',
    defaultMessage: 'New Selection'
  },
  addbuttontitle: {
    id: 'querybuilder.addbuttontitle',
    description: 'Title for the add to current selection button',
    defaultMessage: 'Add to current selection'
  },
  addbuttontext: {
    id: 'querybuilder.addbuttontext',
    description: 'Text for the add to current selection button',
    defaultMessage: 'Add to Selection'
  },
  selectintitle: {
    id: 'querybuilder.selectintitle',
    description: 'Title for the refine current selection button',
    defaultMessage: 'Refine current selection'
  },
  selectintext: {
    id: 'querybuilder.selectintext',
    description: 'Text for the refine current selection button',
    defaultMessage: 'Refine Selection'
  }
});

/**
 * A component that allows users to perform queries on vector layers. Queries can be new queries, added to existing queries or users can filter inside of an existing query a.k.a. drill-down.
 *
 * ```xml
 * <QueryBuilder map={map} />
 * ```
 */
@pureRender
class QueryBuilder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false
    };
  }
  componentDidMount() {
    this._layer = this.refs.layerSelector.getLayer();
  }
  _onLayerSelectChange(layer) {
    this._layer = layer;
  }
  _onSubmit(evt) {
    evt.preventDefault();
  }
  _filterLayerList(lyr) {
    return lyr.get('isSelectable');
  }
  _setQueryFilter() {
    var input = ReactDOM.findDOMNode(this.refs.queryExpression);
    var expression = input.value;
    if (!expression) {
      this._queryFilter = null;
      this.setState({hasError: false});
    } else {
      try {
        this._queryFilter = filtrex(expression);
        this.setState({hasError: false});
      } catch (e) {
        this._queryFilter = null;
        this.setState({hasError: true});
      }
    }
  }
  _doQuery(selectIn) {
    var selection = [];
    this._setQueryFilter();
    if (this._queryFilter === null) {
      return;
    }
    var features = this._layer.getSource().getFeatures();
    for (var i = 0, ii = features.length; i < ii; ++i) {
      var properties = features[i].getProperties();
      if (this._queryFilter(properties)) {
        selection.push(features[i]);
      }
    }
    if (selectIn === true) {
      SelectActions.selectFeaturesInCurrentSelection(this._layer, selection);
    } else {
      SelectActions.selectFeatures(this._layer, selection);
    }
  }
  _addSelection() {
    this._doQuery();
  }
  _newSelection() {
    SelectActions.clear(this._layer);
    this._doQuery();
  }
  _inSelection() {
    this._doQuery(true);
  }
  render() {
    const {formatMessage} = this.props.intl;
    var inputClassName = 'form-control';
    if (this.state.hasError) {
      inputClassName += ' input-has-error';
    }
    return (
      <form onSubmit={this._onSubmit} role="form" className='form-horizontal query-builder'>
        <div className="form-group">
          <Grids.Col md={6}><label htmlFor='layerSelector'>{formatMessage(messages.layerlabel)}</label></Grids.Col>
          <Grids.Col md={18}><LayerSelector onChange={this._onLayerSelectChange.bind(this)} id='layerSelector' ref='layerSelector' filter={this._filterLayerList} map={this.props.map} /></Grids.Col>
        </div>
        <div className='form-group'>
          <Grids.Col md={6}><label htmlFor='query-expression' title={formatMessage(messages.filterbuttontext)}>{formatMessage(messages.filterlabel)}</label></Grids.Col>
          <Grids.Col md={18}><input onKeyUp={this._setQueryFilter.bind(this)} className={inputClassName} ref='queryExpression' id='query-expression' placeholder={formatMessage(messages.filterplaceholder)} type='text' title={formatMessage(messages.filterhelptext)}/></Grids.Col>
        </div>
        <div className='form-group'>
          <Grids.Col md={7}>
            <UI.DefaultButton onClick={this._newSelection.bind(this)} title={formatMessage(messages.newbuttontitle)}> {formatMessage(messages.newbuttontext)}</UI.DefaultButton>
          </Grids.Col>
          <Grids.Col md={8}>
            <UI.DefaultButton onClick={this._addSelection.bind(this)} title={formatMessage(messages.addbuttontitle)}> {formatMessage(messages.addbuttontext)}</UI.DefaultButton>
          </Grids.Col>
          <Grids.Col md={8}>
            <UI.DefaultButton onClick={this._inSelection.bind(this)} title={formatMessage(messages.selectintitle)}> {formatMessage(messages.selectintext)}</UI.DefaultButton>
          </Grids.Col>
      </div>
      </form>
    );
  }
}

QueryBuilder.propTypes = {
  /**
   * The ol3 map whose layers can be used for the querybuilder.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(QueryBuilder);

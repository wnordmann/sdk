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
import FeatureStore from '../stores/FeatureStore.js';
import LayerSelector from './LayerSelector.jsx';
import SelectActions from '../actions/SelectActions.js';
import filtrex from 'filtrex';
import Toolbar from 'material-ui/lib/toolbar/toolbar';
import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';
import Grids from 'pui-react-grids';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import './QueryBuilder.css';
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
  errortext: {
    id: 'querybuilder.errortext',
    description: 'error text to shown when filter does not validate',
    defaultMessage: 'Error setting filter, should be for instance ATTRIBUTE == "Value"'
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
    defaultMessage: 'Add to selection'
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
      errorText: null
    };
  }
  componentDidMount() {
    this._layer = this.refs.layerSelector.getWrappedInstance().getLayer();
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
  _setQueryFilter(evt) {
    const {formatMessage} = this.props.intl;
    var expression;
    if (evt) {
      expression = evt.target.value;
    } else {
      expression = this.refs.queryExpression.getValue();
    }
    if (!expression) {
      this._queryFilter = null;
      this.setState({errorText: null});
    } else {
      try {
        this._queryFilter = filtrex(expression);
        this.setState({errorText: null});
      } catch (e) {
        this._queryFilter = null;
        this.setState({errorText: formatMessage(messages.errortext)});
      }
    }
  }
  _doQuery(selectIn) {
    var selection = [];
    this._setQueryFilter();
    if (this._queryFilter === null) {
      return;
    }
    var features = FeatureStore.getState(this._layer).features;
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
    return (
      <div className='querybuilder'>
        <LayerSelector onChange={this._onLayerSelectChange.bind(this)} id='layerSelector' ref='layerSelector' filter={this._filterLayerList} map={this.props.map} /><br/>
        <TextField hintText={formatMessage(messages.filterplaceholder)} floatingLabelText={formatMessage(messages.filterlabel)} errorText={this.state.errorText} ref='queryExpression' onChange={this._setQueryFilter.bind(this)} /><br/>
        <Toolbar>
          <RaisedButton label={formatMessage(messages.newbuttontext)} onMouseDown={this._newSelection.bind(this)} />
          <RaisedButton label={formatMessage(messages.addbuttontext)} onMouseDown={this._addSelection.bind(this)} />
          <RaisedButton label={formatMessage(messages.selectintext)} onMouseDown={this._inSelection.bind(this)} />
        </Toolbar>
      </div>
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

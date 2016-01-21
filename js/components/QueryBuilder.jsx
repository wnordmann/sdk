import React from 'react';
import ReactDOM from 'react-dom';
import ol from 'openlayers';
import LayerSelector from './LayerSelector.jsx';
import LayerConstants from '../constants/LayerConstants.js';
import AppDispatcher from '../dispatchers/AppDispatcher.js';
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
  filterplaceholder: {
    id: 'querybuilder.filterplaceholder',
    description: 'Placeholder for the expression input field',
    defaultMessage: 'Type expression ....'
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
 */
@pureRender
class QueryBuilder extends React.Component {
  constructor(props) {
    super(props);
    var me = this;
    AppDispatcher.register((payload) => {
      let action = payload.action;
      switch (action.type) {
        case LayerConstants.SELECT_LAYER:
          if (action.cmp === me.refs.layerSelector) {
            me._layer = action.layer;
          }
          break;
        default:
          break;
      }
    });
    this.state = {
      hasError: false
    };
  }
  componentDidMount() {
    this._layer = this.refs.layerSelector.getLayer();
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
          <Grids.Col md={18}><LayerSelector id='layerSelector' ref='layerSelector' filter={this._filterLayerList} map={this.props.map} /></Grids.Col>
        </div>
        <div className='form-group'>
          <Grids.Col md={6}><label htmlFor='query-expression'>{formatMessage(messages.filterlabel)}</label></Grids.Col>
          <Grids.Col md={18}><input onKeyUp={this._setQueryFilter.bind(this)} className={inputClassName} ref='queryExpression' id='query-expression' placeholder={formatMessage(messages.filterplaceholder)} type='text'/></Grids.Col>
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

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
import classNames from 'classnames';
import {intlShape, defineMessages, injectIntl} from 'react-intl';
import LabelEditor from './LabelEditor';
import Paper from 'material-ui/Paper';
import PolygonSymbolizerEditor from './PolygonSymbolizerEditor';
import LineSymbolizerEditor from './LineSymbolizerEditor';
import PointSymbolizerEditor from './PointSymbolizerEditor';
import FilterEditor from './FilterEditor';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import {ListItem} from 'material-ui/List';

const messages = defineMessages({
  removetext: {
    id: 'ruleeditor.removetext',
    description: 'Text for remove list item',
    defaultMessage: 'Remove'
  },
  titlelabel: {
    id: 'ruleeditor.titlelabel',
    description: 'Label for the title text field',
    defaultMessage: 'Title'
  },
  symbolizertitle: {
    id: 'ruleeditor.symbolizertitle',
    description: 'Title for the symbolizer tab',
    defaultMessage: 'Symbolizer'
  },
  labeltitle: {
    id: 'ruleeditor.labeltitle',
    description: 'Title for the label tab',
    defaultMessage: 'Label'
  },
  filtertitle: {
    id: 'ruleeditor.filtertitle',
    description: 'Title for the filter tab',
    defaultMessage: 'Filter'
  }
});

/**
 * Editor for a style rule. This means editing symbolizer properties and filter. Used by the Style Modal.
 *
 * ```xml
 * <RuleEditor geometryType={this.state.geometryType} initialState={symbol} onChange={this._onChange.bind(this)} attributes={this.state.attributes} />
 * ```
 */
class RuleEditor extends React.PureComponent {
  static propTypes = {
    /**
     * List of attributes.
     */
    attributes: React.PropTypes.array,
    /**
     * Initial state.
     */
    initialState: React.PropTypes.object,
    /**
     * Css class name to apply on the root element of this component.
     */
    className: React.PropTypes.string,
    /**
     * Callback that is called when a change is made.
     */
    onChange: React.PropTypes.func.isRequired,
    /**
     * The geometry type.
     */
    geometryType: React.PropTypes.oneOf(['Polygon', 'LineString', 'Point']),
    /**
     * @ignore
     */
    intl: intlShape.isRequired
  };

  static childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
  };

  _getSymbolizer() {
    if (this.props.initialState && this.props.initialState.symbolizers && this.props.initialState.symbolizers.length > 0) {
      return this.props.initialState.symbolizers[0];
    }
  }
  _getTextSymbolizer() {
    if (this.props.initialState) {
      for (var i = 0, ii = this.props.initialState.symbolizers.length; i < ii; ++i) {
        var sym = this.props.initialState.symbolizers[i];
        if (sym.labelAttribute) {
          return sym;
        }
      }
    }
  }
  render() {
    const {formatMessage} = this.props.intl;
    const boxStyle = {
      marginLeft: 0
    };
    var items = [];
    var symbol = this._getSymbolizer();
    if (this.props.geometryType === 'Polygon') {
      items.push(<PolygonSymbolizerEditor key='polygon' onChange={this.props.onChange} initialState={symbol} />);
    } else if (this.props.geometryType === 'LineString') {
      items.push(<LineSymbolizerEditor key='line' onChange={this.props.onChange} initialState={symbol} />);
    } else if (this.props.geometryType === 'Point') {
      items.push(<PointSymbolizerEditor key='point' onChange={this.props.onChange} initialState={symbol} />);
    }
    var textSym = this._getTextSymbolizer();
    items.push(<LabelEditor intl={this.props.intl} key='label' attributes={this.props.attributes} onChange={this.props.onChange} initialFontColor={textSym ? textSym.fontColor : undefined} initialFontSize={textSym ? textSym.fontSize : undefined} initialLabelAttribute={textSym ? textSym.labelAttribute : undefined} />);
    items.push(<FilterEditor intl={this.props.intl} key='filter' onChange={this.props.onChange} initialExpression={this.props.initialState ? this.props.initialState.expression : undefined} />);
    items.push(<ListItem key='delete' onTouchTap={this.props.onRemove} primaryText={formatMessage(messages.removetext)} rightIcon={<ActionDelete />} innerDivStyle={ boxStyle } />);
    return (<Paper className={classNames('sdk-component rule-editor', this.props.className)} zDepth={0}>{items}</Paper>);
  }
}

export default injectIntl(RuleEditor);

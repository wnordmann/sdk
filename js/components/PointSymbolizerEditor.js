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
import FillEditor from './FillEditor';
import Subheader from 'material-ui/Subheader';
import StrokeEditor from './StrokeEditor';
import Slider from 'material-ui/Slider';
import SelectField from 'material-ui/SelectField';
import Paper from 'material-ui/Paper';
import MenuItem from 'material-ui/MenuItem';
import TextField from 'material-ui/TextField';
import {ListItem} from 'material-ui/List';

const messages = defineMessages({
  header: {
    id: 'pointsymbolizereditor.header',
    description: 'Header',
    defaultMessage: 'Symbolizer'
  },
  filllabel: {
    id: 'pointsymbolizereditor.filllabel',
    description: 'Label for fill checkbox',
    defaultMessage: 'Fill'
  },
  strokelabel: {
    id: 'pointsymbolizereditor.strokelabel',
    description: 'Label for stroke checkbox',
    defaultMessage: 'Stroke'
  },
  opacity: {
    id: 'pointsymbolizereditor.opacity',
    description: 'Label for opacity slider',
    defaultMessage: 'Opacity'
  },
  symboltype: {
    id: 'pointsymbolizereditor.symboltype',
    description: 'Label for symbol select field',
    defaultMessage: 'Symbol'
  },
  symbolsize: {
    id: 'pointsymbolizereditor.symbolsize',
    description: 'Label for symbol size input field',
    defaultMessage: 'Size'
  },
  symbolrotation: {
    id: 'pointsymbolizereditor.symbolrotation',
    description: 'Label for symbol rotation input field',
    defaultMessage: 'Rotation'
  },
  externalgraphic: {
    id: 'pointsymbolizereditor.externalgraphic',
    description: 'Label for external graphic field',
    defaultMessage: 'URL'
  }
});

const symboltypes = [
  'circle',
  'square',
  'triangle',
  'star',
  'cross',
  'x'
];

/**
 * Style editor for a point symbolizer. Can edit symbol type, stroke and fill. Is used by the Rule Editor.
 *
 * ```xml
 * <PointSymbolizerEditor onChange={this.props.onChange} initialState={this.props.initialState} />
 * ```
 */
class PointSymbolizerEditor extends React.PureComponent {
  static propTypes = {
    /**
     * Callback that is called when a change is made.
     */
    onChange: React.PropTypes.func.isRequired,
    /**
     * Css class name to apply on the root element of this component.
     */
    className: React.PropTypes.string,
    /**
     * Initial state for the point symbolizer.
     */
    initialState: React.PropTypes.object,
    /**
     * @ignore
     */
    intl: intlShape.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      hasFill: props.initialState ? props.initialState.fillColor !== undefined : true,
      hasStroke: props.initialState ? props.initialState.strokeColor !== undefined : true,
      symbolType: props.initialState && props.initialState.symbolType ? props.initialState.symbolType : 'circle',
      symbolSize: props.initialState && props.initialState.symbolSize ? props.initialState.symbolSize : '4',
      rotation: props.initialState && props.initialState.rotation ? props.initialState.rotation : '0',
      externalGraphic: props.initialState ? props.initialState.externalGraphic : undefined,
      opacity: props.initialState ? props.initialState.opacity : undefined
    };
  }
  componentDidMount() {
    if (this.state.externalGraphic) {
      this._getImageSize(this.state.externalGraphic, function(width, height) {
        this.setState({
          imageWidth: width,
          imageHeight: height
        }, this._onChange);
      }, this);
    } else {
      this._onChange();
    }
  }
  _onChange() {
    this.props.onChange(this.state);
  }
  _getImageSize(url, callback, scope) {
    var newImg = new Image();
    newImg.onload = function() {
      var height = newImg.height;
      var width = newImg.width;
      callback.call(scope, height, width);
    };
    newImg.onerror = function() {
      callback.call(scope, undefined, undefined);
    };
    newImg.src = url;
  }
  _onOpacityChange(evt, value) {
    this.setState({
      opacity: value
    }, this._onChange);
  }
  _onChangeSymbol(evt, idx, value) {
    this.setState({symbolType: value}, this._onChange);
  }
  _onSymbolSizeBlur(evt) {
    this.setState({symbolSize: evt.target.value}, this._onChange);
  }
  _onSymbolSizeChange(evt) {
    this.setState({symbolSize: evt.target.value});
  }
  _onSymbolRotationChange(evt) {
    this.setState({rotation: evt.target.value});
  }
  _onSymbolRotationBlur(evt) {
    this.setState({rotation: evt.target.value}, this._onChange);
  }
  _onUrlChange(evt) {
    this.setState({
      externalGraphic: evt.target.value
    });
  }
  _onUrlBlur(evt) {
    var url = evt.target.value;
    this._getImageSize(url, function(width, height) {
      this.setState({
        externalGraphic: url,
        imageWidth: width,
        imageHeight: height
      }, this._onChange);
    }, this);
  }
  render() {
    var listStyle = {
      padding: '0px 16px',
      marginLeft: 0
    };
    const {formatMessage} = this.props.intl;
    var options = symboltypes.map(function(symbol, idx) {
      return (<MenuItem key={idx} value={symbol} primaryText={symbol} />);
    });
    return (
      <Paper zDepth={0} className={classNames('sdk-component point-symbolizer-editor', this.props.className)}>
        <Subheader>{formatMessage(messages.header)}</Subheader>
        <ListItem innerDivStyle={ listStyle } insetChildren={false}>
          <SelectField fullWidth={true} style={this.state.externalGraphic ? {display: 'none'} : undefined} floatingLabelText={formatMessage(messages.symboltype)} value={this.state.symbolType} onChange={this._onChangeSymbol.bind(this)}>
            {options}
          </SelectField>
        </ListItem>
        <ListItem innerDivStyle={ listStyle }>
          <TextField floatingLabelFixed={true} hintText="Number" fullWidth={true} value={this.state.symbolSize} onChange={this._onSymbolSizeChange.bind(this)} onBlur={this._onSymbolSizeBlur.bind(this)} floatingLabelText={formatMessage(messages.symbolsize)} />
        </ListItem>
        <ListItem innerDivStyle={ listStyle }>
          <TextField floatingLabelFixed={true} fullWidth={true} value={this.state.rotation} onChange={this._onSymbolRotationChange.bind(this)} onBlur={this._onSymbolRotationBlur.bind(this)} floatingLabelText={formatMessage(messages.symbolrotation)} />
        </ListItem>
        <ListItem innerDivStyle={ listStyle }>
          <TextField floatingLabelFixed={true} fullWidth={true} defaultValue={this.state.externalGraphic} onChange={this._onUrlChange.bind(this)} onBlur={this._onUrlBlur.bind(this)} floatingLabelText={formatMessage(messages.externalgraphic)} />
        </ListItem>
        <ListItem innerDivStyle={ listStyle } style={!this.state.externalGraphic ? {display: 'none'} : {width: '100%'}} primaryText={formatMessage(messages.opacity)}>
          <Slider defaultValue={this.state.opacity} onChange={this._onOpacityChange.bind(this)} />
        </ListItem>
        <FillEditor onChange={this.props.onChange} initialHasFill={this.state.hasFill} initialFillColor={this.props.initialState ? this.props.initialState.fillColor : undefined} />
        <StrokeEditor onChange={this.props.onChange} initialHasStroke={this.state.hasStroke} initialStrokeWidth={this.props.initialState ? this.props.initialState.strokeWidth : undefined} initialStrokeColor={this.props.initialState ? this.props.initialState.strokeColor : undefined} />
      </Paper>
    );
  }
}

export default injectIntl(PointSymbolizerEditor);

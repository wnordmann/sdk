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
import FillEditor from './FillEditor';
import StrokeEditor from './StrokeEditor';
import Paper from 'material-ui/Paper';

/**
 * Style editor for a polygon symbolizer. Currently limited to fill and stroke. Used by the Rule Editor.
 *
 * ```xml
 * <PolygonSymbolizerEditor onChange={this.props.onChange} initialState={this.props.initialState} />
 * ```
 */
class PolygonSymbolizerEditor extends React.PureComponent {
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
     * Initial state for the polygon symbolizer.
     */
    initialState: React.PropTypes.object
  };

  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Paper zDepth={0} className={classNames('sdk-component polygon-symbolizer-editor', this.props.className)}>
        <FillEditor initialHasFill={this.props.initialState ? this.props.initialState.hasFill : undefined} onChange={this.props.onChange} initialFillColor={this.props.initialState ? this.props.initialState.fillColor : undefined} />
        <StrokeEditor initialHasStroke={this.props.initialState ? this.props.initialState.hasStroke : undefined} onChange={this.props.onChange} initialStrokeColor={this.props.initialState ? this.props.initialState.strokeColor : undefined} initialStrokeWidth={this.props.initialState ? this.props.initialState.strokeWidth : undefined} />
      </Paper>
    );
  }
}

export default PolygonSymbolizerEditor;

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
import ThemeManager from 'material-ui/lib/styles/theme-manager';
import classNames from 'classnames';
import pureRender from 'pure-render-decorator';
import List from 'material-ui/lib/lists/list';
import ListItem from 'material-ui/lib/lists/list-item';
import WMSLegend from './WMSLegend.jsx';
import Label from './Label.jsx';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import './Legend.css';

const messages = defineMessages({
  header: {
    id: 'legend.header',
    description: 'Header for the legend component',
    defaultMessage: 'Legend'
  },
  emptyheader: {
    id: 'legend.emptyheader',
    description: 'Header for the legend component if no entries',
    defaultMessage: 'No legend available'
  }
});

/**
 * Legend component that can show legend graphic for multiple layer and source types dynamically.
 */
@pureRender
class Legend extends React.Component {
  constructor(props, context) {
    super(props);
    this.state = {
      muiTheme: context.muiTheme || ThemeManager.getMuiTheme()
    };
  }
  getStyles() {
    const muiTheme = this.state.muiTheme;
    const rawTheme = muiTheme.rawTheme;
    return {
      root: {
        background: rawTheme.palette.canvasColor,
        color: rawTheme.palette.textColor
      }
    };
  }
  render() {
    const {formatMessage} = this.props.intl;
    const styles = this.getStyles();
    var legends = [];
    for (var i = 0, ii = this.props.flatLayers.length; i < ii; ++i) {
      var layer = this.props.flatLayers[i];
      if (layer.getVisible()) {
        if ((layer instanceof ol.layer.Tile && layer.getSource() instanceof ol.source.TileWMS) ||
          (layer instanceof ol.layer.Image && layer.getSource() instanceof ol.source.ImageWMS)) {
          var primaryText = layer.get('emptyTitle') ? (<div className='layer-title-empty'>{layer.get('title')}</div>) : layer.get('title');
          legends.push(<ListItem key={'legend-' + layer.get('id')} disableTouchRipple={true}><div>{primaryText}</div><WMSLegend  className='legend-list-img' {...this.props.wmsOptions} layer={layer} /></ListItem>);
        }
      }
    }
    var subHeader = legends.length === 0 ? (<div style={styles.root} className='legend-header'><Label style={styles.root}>{formatMessage(messages.emptyheader)}</Label></div>) : undefined;
    return (
      <div className={classNames('sdk-component legend', this.props.className)}>
        {subHeader}
        <List className='legend-list'>{legends}</List>
      </div>
    );
  }
}

Legend.propTypes = {
  /**
   * Options to send to the WMS legend. See WMSLegend component.
   */
  wmsOptions: React.PropTypes.object,
  /**
   * Css class name to apply on the root element of this component.
   */
  className: React.PropTypes.string,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

Legend.contextTypes = {
  muiTheme: React.PropTypes.object
};

export default injectIntl(Legend);

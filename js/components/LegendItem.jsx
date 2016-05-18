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
import pureRender from 'pure-render-decorator';
import ListItem from 'material-ui/lib/lists/list-item';
import WMSLegend from './WMSLegend.jsx';

/**
 * Legend item for the legend component.
 */
@pureRender
class LegendItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: this.props.layer.getVisible()
    };
  }
  componentDidMount() {
    this.props.layer.on('change:visible', function() {
      this.setState({visible: this.props.layer.getVisible()});
    }, this);
  }
  render() {
    if (this.state.visible) {
      var layer = this.props.layer;
      var legendBody;
      if ((layer instanceof ol.layer.Tile && layer.getSource() instanceof ol.source.TileWMS) ||
        (layer instanceof ol.layer.Image && layer.getSource() instanceof ol.source.ImageWMS)) {
        legendBody = (<WMSLegend {...this.props} />);
      }
      if (legendBody) {
        return <ListItem primaryText={layer.get('title')} leftIcon={legendBody} />;
      } else {
        return (<article />);
      }
    } else {
      return (<article />);
    }
  }
}

LegendItem.propTypes = {
  /**
   * The layer.
   */
  layer: React.PropTypes.instanceOf(ol.layer.Base).isRequired
};

export default LegendItem;

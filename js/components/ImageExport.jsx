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
import 'blueimp-canvas-to-blob';
import FileSaver from 'browser-filesaver';
import UI from 'pui-react-buttons';
import Icon from 'pui-react-iconography';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';

const messages = defineMessages({
  buttontitle: {
    id: 'imageexport.buttontitle',
    description: 'Title for the Export Image button',
    defaultMessage: 'Export as image'
  },
  buttontext: {
    id: 'imageexport.buttontext',
    description: 'Text for the Export Image button',
    defaultMessage: 'Export'
  }
});

/**
 * Export the map as a PNG file. This will only work if the canvas is not tainted.
 *
 * ```xml
 * <ImageExport map={map} />
 * ```
 */
@pureRender
class ImageExport extends React.Component {
  constructor(props) {
    super(props);
  }
  _handleClick() {
    var map = this.props.map;
    map.once('postcompose', function(evt) {
      var canvas = evt.context.canvas;
      canvas.toBlob(function(blob) {
        FileSaver.saveAs(blob, 'map.png');
      });
    });
    map.renderSync();
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <UI.DefaultButton title={formatMessage(messages.buttontitle)} onClick={this._handleClick.bind(this)}>
        <Icon.Icon name="camera" /> {formatMessage(messages.buttontext)}
      </UI.DefaultButton>
    );
  }
}

ImageExport.propTypes = {
  /**
   * The ol3 map to export as PNG.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(ImageExport);

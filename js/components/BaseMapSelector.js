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
import classNames from 'classnames';
import Button from './Button';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import BaseMapModal from './BaseMapModal';

const messages = defineMessages({
  buttontext: {
    id: 'basemapselector.buttontext',
    description: 'Button text for base map',
    defaultMessage: 'Basemap'
  }
});

/**
 * Button that shows a base map dialog for selecting the base map.
 *
 * ```xml
 * <BaseMapSelector map={map} />
 * ```
 */
class BaseMapSelector extends React.PureComponent {
  static propTypes = {
    /**
     * The OpenLayers Map.
     */
    map: React.PropTypes.instanceOf(ol.Map).isRequired,
    /**
     * Css class name to apply on the root element of this component.
     */
    className: React.PropTypes.string,
    /**
     * @ignore
     */
    intl: intlShape.isRequired
  };

  static childContextTypes = {
    muiTheme: React.PropTypes.object.isRequired
  };

  constructor(props) {
    super(props);
  }
  _showBaseMapDialog() {
    this.refs.basemapmodal.getWrappedInstance().open();
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <Button className={classNames('sdk-component basemapselector', this.props.className)} label={formatMessage(messages.buttontext)} onTouchTap={this._showBaseMapDialog.bind(this)}>
        <BaseMapModal ref='basemapmodal' {...this.props} />
      </Button>
    );
  }
}

export default injectIntl(BaseMapSelector);

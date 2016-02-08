/*
Copyright 2016 Boundless, http://boundlessgeo.com
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License
*/

import React from 'react';
import ol from 'openlayers';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import pureRender from 'pure-render-decorator';

const messages = defineMessages({
  buttontitle: {
    id: 'homebutton.buttontitle',
    description: 'Title for the home button',
    defaultMessage: 'Home'
  }
});

/**
 * A button to go back to the initial extent of the map.
 */
@pureRender
class HomeButton extends React.Component {
  constructor(props) {
    super(props);
    var view = this.props.map.getView();
    this._center = view.getCenter();
    this._resolution = view.getResolution();
    if (this._center === null) {
      view.once('change:center', function(evt) {
        this._center = evt.target.getCenter();
      }, this);
    }
    if (this._resolution === undefined) {
      view.once('change:resolution', function(evt) {
        this._resolution = evt.target.getResolution();
      }, this);
    }
  }
  _goHome() {
    if (this._center !== null && this._resolution !== undefined) {
      var view = this.props.map.getView();
      view.setCenter(this._center);
      view.setResolution(this._resolution);
    }
  }
  render() {
    const {formatMessage} = this.props.intl;
    return (
      <button title={formatMessage(messages.buttontitle)} onClick={this._goHome.bind(this)}><i className='fa fa-home'></i></button>
    );
  }
}

HomeButton.propTypes = {
  /**
   * The ol3 map for whose view the initial center and zoom should be restored.
   */
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  /**
   * i18n message strings. Provided through the application through context.
   */
  intl: intlShape.isRequired
};

export default injectIntl(HomeButton);

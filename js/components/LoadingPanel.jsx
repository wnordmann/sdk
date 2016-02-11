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
import LayerStore from '../stores/LayerStore.js';
import pureRender from 'pure-render-decorator';
import './LoadingPanel.css';

/**
 * A loading panel shows a spinner when tiles or images are loading.
 */
@pureRender
class LoadingPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: null
    };
    this._loading = 0;
    this._loaded = 0;
    LayerStore.bindMap(this.props.map);
  }
  componentWillMount() {
    this._onChangeCb = this._onChange.bind(this);
    LayerStore.addChangeListener(this._onChangeCb);
    this._onChange();
  }
  componentWillUnmount() {
    LayerStore.removeChangeListener(this._onChangeCb);
  }
  _addLoading() {
    if (this._loading === 0) {
      this.setState({show: true});
    }
    ++this._loading;
    this._update();
  }
  _hide() {
    if (this._loading === this._loaded) {
      this.setState({show: false});
    }
  }
  _update() {
    if (this._loading === this._loaded) {
      this._loading = 0;
      this._loaded = 0;
      var me = this;
      global.setTimeout(function() {
        me._hide();
      }, 100);
    }
  }
  _addLoaded() {
    var me = this;
    global.setTimeout(function() {
      ++me._loaded;
      me._update();
    }, 100);
  }
  _onChange() {
    var layers = LayerStore.getState().flatLayers;
    var me = this;
    layers.forEach(function(lyr) {
      var source = lyr.getSource();
      if (source instanceof ol.source.Tile) {
        source.on('tileloadstart', me._addLoading, me);
        source.on('tileloadend', me._addLoaded, me);
        source.on('tileloaderror', me._addLoaded, me);
      } else if (source instanceof ol.source.Image) {
        source.on('imageloadstart', me._addLoading, me);
        source.on('imageloadend', me._addLoaded, me);
        source.on('imageloaderror', me._addLoaded, me);
      }
    });
  }
  render() {
    if (this.state.show) {
      return (
        <div className="loading-panel spinner-lg bkg-default-5 out">
          <i className="fa fa-spin fa-cog mtxl"></i>
        </div>
      );
    } else {
      return (<article />);
    }
  }
}

LoadingPanel.propTypes = {
  map: React.PropTypes.instanceOf(ol.Map).isRequired
}

export default LoadingPanel;

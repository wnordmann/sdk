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
import Dialog from 'material-ui/Dialog';
import {GridList, GridTile} from 'material-ui/GridList';
import Subheader from 'material-ui/Subheader';

class BaseMapModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: true,
      tileServices: [{
        name: 'Mapbox Satellite Streets',
        description: 'Mapbox Satellite Streets Tiles',
        endpoint: 'http://api.dev.boundlessgeo.com/v1/basemaps/mapbox/satellite-streets/{z}/{x}/{y}.png',
        standard: 'XYZ',
        token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik9FUXhRakl6UmpVME5qZzJRakZHUVVJeVJEUkVSak5CUWpReE1UbEVOVGRCT1VORE9UQkdNdyJ9.eyJuYW1lIjoidGVzdEBib3VuZGxlc3NnZW8uY29tIiwiZW1haWwiOiJ0ZXN0QGJvdW5kbGVzc2dlby5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImFwcF9tZXRhZGF0YSI6eyJTaXRlUm9sZXMiOiJ0ZXN0aW5nIn0sImlzcyI6Imh0dHBzOi8vYm91bmRsZXNzZ2VvLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw1ODFkMTI4ZGQyNGI5MjhlNzk4MjJiMmMiLCJhdWQiOiJKblFxZ0VQMHg3SHZqM3ZrTFhDZEtUQWRRVDNGSTJxUiIsImV4cCI6MTQ3ODU2MjUyNywiaWF0IjoxNDc4NTI2NTI3fQ.Sy_my8YE_26upsgavQMaikGbpmO5kfRmDjA-jX0mv4mdmgLfM97QKomH_xtYffzqfQ8udydS7HFPVtf4_kzO9ZZSho0ThwS6JruYj03P_CiQGrnaGzWk3ucEPz_P6lHcEV95StNNW0F3Wt3p_PI9z23rvJDtdS0VFFuB_sI2EVcs-1M1lcFJZrzb1wL0zV1jkj0ol9ze3Tru1qDLNn11qw4dttSvsfTfk70pqLgmF1yhgDZp-fJ29y-W2zjnJQquzYdRyeElmQVoGoK5MmHnE9cmIoNNE6x_hdI8pvXeQiyQDNm0KhKTlDgSMqXhzcqT4Pd9FbroM4COBMAarjsnkA',
        thumbnail: 'https://a.tile.openstreetmap.org/0/0/0.png'
      }]
    };
  }
  close() {
    this.setState({open: false});
  }
  _createSource(config) {
    if (config.standard === 'XYZ') {
      return new ol.source.XYZ({
        url: config.endpoint,
        tileLoadFunction: function(image, src) {
          var img = image.getImage();
          if (typeof window.btoa == 'function') {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', src, true);
            xhr.setRequestHeader('Authorization', 'Bearer ' + config.token);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function(e) {
              if (this.status == 200) {
                var uInt8Array = new Uint8Array(this.response);
                var i = uInt8Array.length;
                var binaryString = new Array(i);
                while (i--) {
                  binaryString[i] = String.fromCharCode(uInt8Array[i]);
                }
                var data = binaryString.join('');
                var type = xhr.getResponseHeader('content-type');
                if (type.indexOf('image') === 0) {
                  img.src = 'data:' + type + ';base64,' + window.btoa(data);
                }
              }
            };
            xhr.send();
          } else {
            img.src = src;
          }
        }
      });
    }
  }
  _createLayer(name) {
    var config;
    for (var i = 0, ii = this.state.tileServices.length; i < ii; ++i) {
      if (this.state.tileServices[i].name === name) {
        config = this.state.tileServices[i];
        break;
      }
    }
    return new ol.layer.Tile({
      title: config.description,
      source: this._createSource(config)
    });
  }
  _tileClick(name) {
    this.props.map.addLayer(this._createLayer(name));
  }
  render() {
    return (<Dialog title='Base Layers' modal={true} open={this.state.open} onRequestClose={this.close.bind(this)}>
      <GridList cellHeight={180}>
        <Subheader>Select a basemap</Subheader>
        {this.state.tileServices.map((tileService) => (
          <GridTile style={{cursor: 'pointer'}} onTouchTap={this._tileClick.bind(this, tileService.name)}
            key={tileService.name}
            title={tileService.description}>
            <img src={tileService.thumbnail} />
          </GridTile>
        ))}
      </GridList>
    </Dialog>);
  }
}

export default BaseMapModal;

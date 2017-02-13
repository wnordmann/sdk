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

import LayerListView from '../components/LayerListView';
import {connect} from 'react-redux';

const mapStateToProps = (state) => {
  return {
    layers: state.layers.layers
  };
};

const removeLayer = (map, layer, group) => {
  if (group) {
    group.remove(layer);
  } else {
    map.removeLayer(layer);
  }
};

const moveLayer = (map, hoverIndex, layer, group) => {
  var layers = group ? group.getLayers() : map.getLayers();
  layers.remove(layer);
  layers.insertAt(hoverIndex, layer);
};

const mapDispatchToProps = (dispatch) => {
  return {
    onLayerMove: moveLayer,
    onLayerRemove: removeLayer
  };
};

const LayerList = connect(
  mapStateToProps,
  mapDispatchToProps
)(LayerListView);

export default LayerList;

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

import LayerSelectorView from '../components/LayerSelectorView';
import {connect} from 'react-redux';
import {findLayerById} from '../state/layers/reducers';

const mapStateToProps = (state, props) => {
  return {
    layers: props.filter ? state.layers.flatLayers.filter(function(layerObj) {
      return props.filter(findLayerById(layerObj.id));
    }) : state.layers.flatLayers
  };
};

const LayerSelector = connect(
  mapStateToProps,
  null
)(LayerSelectorView);

export default LayerSelector;

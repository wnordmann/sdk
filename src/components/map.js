/** Provide an OpenLayers map which reflects the
 *  state of the  store.
 */

import React from 'react';

import { connect } from 'react-redux';

import { setView } from '../actions/map';

import olMap from 'ol/map';
import View from 'ol/view';

import TileLayer from 'ol/layer/tile';
import XyzSource from 'ol/source/xyz';


function configureXyzSource(glSource) {
  const source = new XyzSource({
      attributions: glSource.attribution,
      minZoom: glSource.minzoom,
      maxZoom: 'maxzoom' in glSource ? glSource.maxzoom : 22,
      tileSize: glSource.tileSize || 512,
      //url: url,
      urls: glSource.tiles,
      crossOrigin: 'crossOrigin' in glSource ? glSource.crossOrigin : 'anonymous',
    });

  source.setTileLoadFunction(function(tile, src) {
    if (src.indexOf('{bbox-epsg-3857}') != -1) {
      var bbox = source.getTileGrid().getTileCoordExtent(tile.getTileCoord());
      src = src.replace('{bbox-epsg-3857}', bbox.toString());
    }
    tile.getImage().src = src;
  });

  return source;
}

function configureRasterLayer(olSource, glLayer) {
  return new TileLayer({
    source: olSource,
    visible: glLayer.layout ? glLayer.layout.visibility !== 'none' : true,
  });
}

function configureSource(glSource) {
  if(glSource.tiles) {
    return configureXyzSource(glSource);
  }
  return null;
}

function configureLayer(sourceDef, glLayer) {

}


class Map extends React.Component {


  constructor(props) {
    super(props);

    this.sourcesVersion = null;
    this.layersVersion = null;
    // keep a version of the sources in
    //  their OpenLayers source definition.
    this.sources = {};

    // hash of the openlayers layers in the map.
    this.layers = [];
  }

  /** Initialize the map */
  configureMap() {
    this.map = new olMap({
      target: this.refs.mapdiv,
      view: new View({
        center: this.props.map.center,
        zoom: this.props.map.zoom,
      })
    });

    // when the map moves update the location in the state
    this.map.on('moveend', (evt) => {
      this.props.setView(this.map.getView());
    });

    // bootstrap the map with the current configuration.
    this.configureSources(this.props.map.sources);
    this.configureLayers(this.props.map.sources, this.props.map.layers);
  }

  /** Convert the GL source definitions into internal
   *  OpenLayers source definitions.
   */
  configureSources(sourcesDef) {
    this.sourcesVersion = sourcesDef._sourcesVersion;
    // TODO: Update this to check "diff" configurations
    //       of sources.  Currently, this will only detect
    //       additions and removals.
    for(const source_name in sourcesDef) {
      // Add the source because it's not in the current
      //  list of sources.
      if(!(source_name in this.sources)) {
        this.sources[source_name] = configureSource(sourcesDef[source_name]);
      }
    }

    // remove sources no longer there.
    for(const source_name in this.sources) {
      if(!(source_name in sourcesDef)) {
        // TODO: Remove all layers that are using this source.
        delete this.sources[source_name];
      }
    }
  }

  configureLayers(sourcesDef, layersDef) {
    this.layersVersion = layersDef._layersVersion;
    // layers is an array.
    for(let i = 0, ii = layersDef.length; i < ii; i++) {
      const layer = layersDef[i];
      const is_visible = layer.layout ? layer.layout.visibility !== 'none' : true;

      if(!(layer.id in this.layers)) {
        const layer_src = sourcesDef[layer.source];
        let new_layer = null;
        if(layer_src.type === 'raster') {
          if('tiles' in layer_src) {
            new_layer = new TileLayer({
              source: this.sources[layer.source],
            });
          }
        }
        // if the new layer has been defined, add it to the map.
        if(new_layer !== null) {
          this.layers[layer.id] = new_layer;
          this.map.addLayer(this.layers[layer.id]);
        }
      }

      // handle visibility and z-ordering.
      if(layer.id in this.layers) {
        this.layers[layer.id].setVisible(is_visible);
        this.layers[layer.id].setZIndex(i);
      }
    }
  }

  componentDidMount() {
    // put the map into the DOM
    this.configureMap();
  }

  /** This will check nextProps and nextState to see
   *  what needs to be updated on the map.
   */
  shouldComponentUpdate(nextProps, nextState) {
    // compare the centers
    if(nextProps.map.center[0] !== this.props.map.center[0]
      || nextProps.map.center[1] !== this.props.map.center[1]
      || nextProps.map.zoom !== this.props.zoom) {
      this.map.getView().setCenter(nextProps.map.center);
      this.map.getView().setZoom(nextProps.map.zoom);
    }

    // check the sources diff
    if(this.sourcesVersion !== nextProps.map._sourcesVersion) {
      // go through and update the sources.
      this.configureSources(nextProps.map.sources);
    }
    if(this.layersVersion !== nextProps.map._layersVersion) {
      // go through and update the layers.
      this.configureLayers(nextProps.map.sources, nextProps.map.layers);
    }

    // This should always return false to keep
    // render() from being called.
    return false;
  }

  render() {
    return (
      <div ref="mapdiv" className="map">
      </div>
    );
  }
}


const mapStateToProps = (state) => {
  return {
    map: state.map
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setView: (view) => {
      dispatch(setView(view.getCenter(), view.getZoom()));
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);

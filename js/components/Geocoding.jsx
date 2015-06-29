/* global ol */
import React from 'react';
import './Geocoding.css';

export default class Geocoding extends React.Component {
  constructor(props) {
    super(props);
    this.state = {searchResults: null};
  }
  componentDidMount() {
    this._layer = new ol.layer.Vector({
      hideFromLayerList: true,
      managed: false,
      style: new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 46],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          opacity: 0.75,
          src: './resources/marker.png'
        })
      }),
      source: new ol.source.Vector()
    });
    this.props.map.addLayer(this._layer);
  }
  _searchBoxKeyPressed(e) {
    if (e.which === 13){
      this._searchAddress();
    }
  }
  _searchAddress() {
    var inp = document.getElementById('geocoding-search');
    if (inp.value === ''){
      document.getElementById('geocoding-results').style.display = 'none';
      return;
    }
    var me = this;
    var cbname = 'fn' + Date.now();
    var script = document.createElement('script');
    script.src = 'http://nominatim.openstreetmap.org/search?format=json&limit=5&q=' + inp.value + '&json_callback=' + cbname;
    window[cbname] = function(jsonData) {
      document.getElementById('geocoding-results').style.display = 'block';
      me.setState({
        searchResults: jsonData
      });
      delete window[cbname];
    };
    document.head.appendChild(script);
  }
  _zoomTo(result) {
    var map = this.props.map;
    var center = [parseFloat(result.lon), parseFloat(result.lat)];
    center = ol.proj.transform(center, 'EPSG:4326', map.getView().getProjection());
    document.getElementById('geocoding-results').style.display = 'none';
    map.getView().setCenter(center);
    map.getView().setZoom(this.props.zoom);
    var source = this._layer.getSource();
    source.clear();
    source.addFeature(new ol.Feature({
        geometry: new ol.geom.Point(center)
    }));
  }
  render() {
    var me = this;
    var resultNodes;
    if (this.state.searchResults !== null) {
      if (this.state.searchResults.length > 0) {
        resultNodes = this.state.searchResults.map(function(result) {
          return (
            <a href='#' key={result.place_id}><li key={result.place_id} onClick={me._zoomTo.bind(me, result)}>{result.display_name}</li></a>
          );
        });
      } else {
        resultNodes = <p>No results found</p>;
      }
    }
    return (
      <div>
        <div className='input-group'>
          <input type='text' onKeyPress={this._searchBoxKeyPressed.bind(this)} id='geocoding-search' className='form-control' placeholder='Search placename...'/>
          <div className='input-group-btn'>
            <button className='btn btn-default' onClick={this._searchAddress.bind(this)}><span>&nbsp;</span><i className='glyphicon glyphicon-search'></i></button>
          </div>
        </div>
        <div id='geocoding-results' className='geocoding-results'>
          <ul>
            {resultNodes}
          </ul>
        </div>
      </div>
    );
  }
}

Geocoding.propTypes = {
  map: React.PropTypes.instanceOf(ol.Map).isRequired,
  zoom: React.PropTypes.number
};

Geocoding.defaultProps = {
  zoom: 10
};

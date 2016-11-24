/* global beforeEach, describe, it */

import {assert} from 'chai';
import raf from 'raf';
import ol from 'openlayers';
import WMTSService from '../../js/services/WMTSService';

raf.polyfill();

describe('WMTSService', function() {

  var layer, view;

  beforeEach(function() {
    var projection = ol.proj.get('EPSG:3857');
    var projectionExtent = projection.getExtent();
    var size = ol.extent.getWidth(projectionExtent) / 256;
    var resolutions = new Array(14);
    var matrixIds = new Array(14);
    for (var z = 0; z < 14; ++z) {
      // generate resolutions and matrixIds arrays for this WMTS
      resolutions[z] = size / Math.pow(2, z);
      matrixIds[z] = 'EPSG:900913:' + z;
    }
    view = new ol.View();
    layer = new ol.layer.Tile({
      title: 'foo',
      popupInfo: '#AllAttributes',
      extent: [ol.proj.fromLonLat([-179.23023299999997, 17.831509000000036])[0], ol.proj.fromLonLat([-179.23023299999997, 17.831509000000036])[1], ol.proj.fromLonLat([-65.16882499999997, 71.437769])[0], ol.proj.fromLonLat([-65.16882499999997, 71.437769])[1]],
      source: new ol.source.WMTS({
        url: 'http://demo.boundlessgeo.com/geoserver/gwc/service/wmts?',
        layer: 'usa:states',
        matrixSet: 'EPSG:900913',
        format: 'image/png',
        projection: projection,
        tileGrid: new ol.tilegrid.WMTS({
          origin: ol.extent.getTopLeft(projectionExtent),
          resolutions: resolutions,
          matrixIds: matrixIds
        }),
        style: ''
      })
    });
    view.setResolution(9783.93962050256);
  });

  it('creates the correct GetFeatureInfo url', function() {
    var url = WMTSService.getFeatureInfoUrl(layer, [-12355128.377959318, 4862617.991389772], view, 'application/vnd.ogc.gml');
    assert.equal(url, 'http://demo.boundlessgeo.com/geoserver/gwc/service/wmts?service=WMTS&request=GetFeatureInfo&version=1.0.0&layer=usa%3Astates&infoformat=application%2Fvnd.ogc.gml&style=&format=image%2Fpng&tilecol=3&tilerow=6&tilematrix=EPSG%3A900913%3A4&tilematrixset=EPSG%3A900913&i=17&j=15');
  });

  it('generates the correct url for GetCapabilities', function() {
    var url = 'http://demo.boundlessgeo.com/geoserver/gwc/service/wmts';
    assert.equal(WMTSService.getCapabilitiesUrl(url), url + '?request=GetCapabilities&version=1.0.0');
  });

  it('parses response correctly and can create layer', function() {
    var url = 'http://demo.boundlessgeo.com/geoserver/gwc/service/wmts';
    var info = WMTSService.parseCapabilities({responseText: '<?xml version="1.0" encoding="UTF-8"?><Capabilities xmlns="http://www.opengis.net/wmts/1.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:gml="http://www.opengis.net/gml" xsi:schemaLocation="http://www.opengis.net/wmts/1.0 http://schemas.opengis.net/wmts/1.0/wmtsGetCapabilities_response.xsd" version="1.0.0"><ows:ServiceIdentification><ows:Title>Web Map Tile Service - GeoWebCache</ows:Title><ows:ServiceType>OGC WMTS</ows:ServiceType><ows:ServiceTypeVersion>1.0.0</ows:ServiceTypeVersion></ows:ServiceIdentification><ows:OperationsMetadata><ows:Operation name="GetFeatureInfo"><ows:DCP><ows:HTTP><ows:Get xlink:href="http://localhost:8080/geoserver/gwc/service/wmts?"><ows:Constraint name="GetEncoding"><ows:AllowedValues><ows:Value>KVP</ows:Value></ows:AllowedValues></ows:Constraint></ows:Get></ows:HTTP></ows:DCP></ows:Operation><ows:Operation name="GetTile"><ows:DCP><ows:HTTP><ows:Get xlink:href="http://localhost:8080/geoserver/gwc/service/wmts?"><ows:Constraint name="GetEncoding"><ows:AllowedValues><ows:Value>KVP</ows:Value></ows:AllowedValues></ows:Constraint></ows:Get></ows:HTTP></ows:DCP></ows:Operation></ows:OperationsMetadata><Contents><Layer><ows:Title>Digital elevation model</ows:Title><ows:Abstract>USGS GTOPO30 digital elevation model</ows:Abstract><ows:WGS84BoundingBox><ows:LowerCorner>-100.0 -9.999999999980012</ows:LowerCorner><ows:UpperCorner>-60.000000000015994 39.99999999999999</ows:UpperCorner></ows:WGS84BoundingBox><ows:Identifier>usgs:dem</ows:Identifier><Style isDefault="true"><ows:Identifier/></Style><Format>image/jpeg</Format><Format>image/png</Format><InfoFormat>text/plain</InfoFormat><TileMatrixSetLink><TileMatrixSet>EPSG:3857</TileMatrixSet></TileMatrixSetLink></Layer><TileMatrixSet><ows:Identifier>EPSG:3857</ows:Identifier><ows:SupportedCRS>urn:ogc:def:crs:EPSG::3857</ows:SupportedCRS><TileMatrix><ows:Identifier>EPSG:3857:0</ows:Identifier><ScaleDenominator>5.0E8</ScaleDenominator><TopLeftCorner>90.0 -180.0</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>2</MatrixWidth><MatrixHeight>1</MatrixHeight></TileMatrix></TileMatrixSet></Contents><ServiceMetadataURL xlink:href="http://localhost:8080/geoserver/gwc/service/wmts?REQUEST=getcapabilities&amp;VERSION=1.0.0"/></Capabilities>'}, url);
    assert.equal(info.Layer.length, 1);
    assert.equal(info.Layer[0].Name, 'usgs:dem');
    assert.equal(info.Layer[0].Title, 'Digital elevation model');
    assert.equal(info.Title, 'Web Map Tile Service - GeoWebCache');
    var layer = WMTSService.createLayer(info.Layer[0], url, {title: 'Digital elevation model', isEmpty: false}, ol.proj.get('EPSG:4326'));
    assert.equal(layer instanceof ol.layer.Tile, true);
    assert.equal(layer.get('title'), 'Digital elevation model');
    assert.equal(layer.get('popupInfo'), '#AllAttributes');
    var source = layer.getSource();
    assert.equal(source instanceof ol.source.WMTS, true);
    // png even if jpeg is the first one
    assert.equal(source.getFormat(), 'image/png');
  });

});

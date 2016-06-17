/* global beforeEach, describe, it */

var assert = require('chai').assert;
var raf = require('raf');
raf.polyfill();
var ol = require('openlayers');

var WFSService = require('../../js/services/WFSService.js');

describe('WFSService', function() {

  var feature, layer, view;

  beforeEach(function() {
    view = new ol.View();
    layer = new ol.layer.Vector({
      wfsInfo: {
        featureNS: 'http://foo',
        featureType: 'bar'
      }
    });
    feature = new ol.Feature({foo: 'bar'});
    feature.setId('foo.1');
    feature.setGeometry(new ol.geom.Point([100, 200]));
    feature.setGeometryName('the_geom');
  });

  it('creates the correct insert XML', function() {
    var xml = WFSService.getInsertPayload(layer.get('wfsInfo'), view, feature);
    assert.equal(xml, '<Transaction xmlns="http://www.opengis.net/wfs" service="WFS" version="1.1.0" xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><Insert><bar xmlns="http://foo" fid="foo.1"><foo>bar</foo><geometry><Point xmlns="http://www.opengis.net/gml" srsName="EPSG:3857"><pos>100 200</pos></Point></geometry></bar></Insert></Transaction>');
  });

  it('handles insert response', function(done) {
    var result = '<?xml version="1.0" encoding="UTF-8"?><wfs:TransactionResponse xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wfs="http://www.opengis.net/wfs" xmlns:ne="http://www.naturalearthdata.com" xmlns:ows="http://www.opengis.net/ows" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:gml="http://www.opengis.net/gml" xmlns:opengeo="http://opengeo.org" xmlns:usa="http://census.gov" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.1.0" xsi:schemaLocation="http://www.opengis.net/wfs http://localhost:8080/geoserver/schemas/wfs/1.1.0/wfs.xsd"><wfs:TransactionSummary><wfs:totalInserted>1</wfs:totalInserted><wfs:totalUpdated>0</wfs:totalUpdated><wfs:totalDeleted>0</wfs:totalDeleted></wfs:TransactionSummary><wfs:TransactionResults/><wfs:InsertResults><wfs:Feature><ogc:FeatureId fid="new0"/></wfs:Feature></wfs:InsertResults></wfs:TransactionResponse>';
    var xmlhttp = {
      responseXML: ol.xml.parse(result)
    };
    WFSService.handleInsertResponse(xmlhttp, function(id) {
      assert.equal(id, 'new0');
      done();
    });
  });

});

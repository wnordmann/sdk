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
        url: 'http://localhost/geoserver',
        geometryName: 'geom',
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

  it('creates the correct update XML', function() {
    feature.set('boundedBy', '0');
    feature.set('bbox', '0');
    var xml = WFSService.getUpdatePayload(layer.get('wfsInfo'), view, feature, {foo: 'baz'});
    assert.equal(xml, '<Transaction xmlns="http://www.opengis.net/wfs" service="WFS" version="1.1.0" xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><Update typeName="feature:bar" xmlns:feature="http://foo"><Property><Name>foo</Name><Value>baz</Value></Property><Filter xmlns="http://www.opengis.net/ogc"><FeatureId fid="foo.1"/></Filter></Update></Transaction>');
  });

  it('creates the correct update XML for geometry updates', function() {
    var xml = WFSService.getUpdatePayload(layer.get('wfsInfo'), view, feature, null);
    assert.equal(xml, '<Transaction xmlns="http://www.opengis.net/wfs" service="WFS" version="1.1.0" xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><Update typeName="feature:bar" xmlns:feature="http://foo"><Property><Name>foo</Name><Value>bar</Value></Property><Property><Name>geometry</Name><Value><Point xmlns="http://www.opengis.net/gml" srsName="EPSG:3857"><pos>100 200</pos></Point></Value></Property><Filter xmlns="http://www.opengis.net/ogc"><FeatureId fid="foo.1"/></Filter></Update></Transaction>');
  });

  it('handles update response', function(done) {
    var result = '<?xml version="1.0" encoding="UTF-8"?><wfs:TransactionResponse xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wfs="http://www.opengis.net/wfs" xmlns:ne="http://www.naturalearthdata.com" xmlns:ows="http://www.opengis.net/ows" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:gml="http://www.opengis.net/gml" xmlns:opengeo="http://opengeo.org" xmlns:usa="http://census.gov" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.1.0" xsi:schemaLocation="http://www.opengis.net/wfs http://localhost:8080/geoserver/schemas/wfs/1.1.0/wfs.xsd"><wfs:TransactionSummary><wfs:totalInserted>0</wfs:totalInserted><wfs:totalUpdated>1</wfs:totalUpdated><wfs:totalDeleted>0</wfs:totalDeleted></wfs:TransactionSummary><wfs:TransactionResults/><wfs:InsertResults><wfs:Feature><ogc:FeatureId fid="none"/></wfs:Feature></wfs:InsertResults></wfs:TransactionResponse>';
    var xmlhttp = {
      responseXML: ol.xml.parse(result)
    };
    WFSService.handleUpdateResponse(xmlhttp, function(result) {
      assert.equal(result.transactionSummary.totalUpdated, 1);
      done();
    });
  });

  it('creates the correct delete XML', function() {
    var xml = WFSService.getDeletePayload(layer.get('wfsInfo'), feature);
    assert.equal(xml, '<Transaction xmlns="http://www.opengis.net/wfs" service="WFS" version="1.1.0" xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><Delete typeName="feature:bar" xmlns:feature="http://foo"><Filter xmlns="http://www.opengis.net/ogc"><FeatureId fid="foo.1"/></Filter></Delete></Transaction>');
  });

  it('handles delete response', function(done) {
    var result = '<?xml version="1.0" encoding="UTF-8"?><wfs:TransactionResponse xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wfs="http://www.opengis.net/wfs" xmlns:ne="http://www.naturalearthdata.com" xmlns:ows="http://www.opengis.net/ows" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:gml="http://www.opengis.net/gml" xmlns:opengeo="http://opengeo.org" xmlns:usa="http://census.gov" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.1.0" xsi:schemaLocation="http://www.opengis.net/wfs http://localhost:8080/geoserver/schemas/wfs/1.1.0/wfs.xsd"><wfs:TransactionSummary><wfs:totalInserted>0</wfs:totalInserted><wfs:totalUpdated>0</wfs:totalUpdated><wfs:totalDeleted>1</wfs:totalDeleted></wfs:TransactionSummary><wfs:TransactionResults/><wfs:InsertResults><wfs:Feature><ogc:FeatureId fid="none"/></wfs:Feature></wfs:InsertResults></wfs:TransactionResponse>';
    var xmlhttp = {
      responseXML: ol.xml.parse(result)
    };
    WFSService.handleDeleteResponse(xmlhttp, function() {
      assert.equal(true, true);
      done();
    });
  });

  it('handles delete response failure', function(done) {
    var result = '<?xml version="1.0" encoding="UTF-8"?><wfs:TransactionResponse xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:ogc="http://www.opengis.net/ogc" xmlns:wfs="http://www.opengis.net/wfs" xmlns:ne="http://www.naturalearthdata.com" xmlns:ows="http://www.opengis.net/ows" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:gml="http://www.opengis.net/gml" xmlns:opengeo="http://opengeo.org" xmlns:usa="http://census.gov" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" version="1.1.0" xsi:schemaLocation="http://www.opengis.net/wfs http://localhost:8080/geoserver/schemas/wfs/1.1.0/wfs.xsd"><wfs:TransactionSummary><wfs:totalInserted>0</wfs:totalInserted><wfs:totalUpdated>0</wfs:totalUpdated><wfs:totalDeleted>0</wfs:totalDeleted></wfs:TransactionSummary><wfs:TransactionResults/><wfs:InsertResults><wfs:Feature><ogc:FeatureId fid="none"/></wfs:Feature></wfs:InsertResults></wfs:TransactionResponse>';
    var xmlhttp = {
      responseXML: ol.xml.parse(result)
    };
    WFSService.handleDeleteResponse(xmlhttp, function() {}, function() {
      assert.equal(true, true);
      done();
    });
  });

  it('handles generating distance within url correctly', function() {
    var url = WFSService.generateDistanceWithinUrl(layer, view, [0, 0]);
    assert.equal(url, 'http://localhost/geoserver?service=WFS&request=GetFeature&version=1.1.0&srsName=EPSG%3A3857&typename=bar&cql_filter=DWITHIN(geom%2C%20Point(0%200)%2C%200.1%2C%20meters)');
  });

  it('uses correct GetCapabilities url', function() {
    var url = WFSService.getCapabilitiesUrl(layer.get('wfsInfo').url);
    assert.equal(url, 'http://localhost/geoserver?service=WFS&version=1.1.0&request=GetCapabilities');
  });

  it('handles parsing of GetCapabilities', function() {
    var caps = '<?xml version="1.0" encoding="UTF-8"?><wfs:WFS_Capabilities version="1.1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns="http://www.opengis.net/wfs" xmlns:wfs="http://www.opengis.net/wfs" xmlns:ows="http://www.opengis.net/ows" xmlns:gml="http://www.opengis.net/gml" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xlink="http://www.w3.org/1999/xlink" xsi:schemaLocation="http://www.opengis.net/wfs http://localhost:8080/geoserver/schemas/wfs/1.1.0/wfs.xsd" xmlns:ne="http://www.naturalearthdata.com" xmlns:opengeo="http://opengeo.org" xmlns:usa="http://census.gov" xmlns:usgs="http://www.usgs.gov" updateSequence="537"><ows:ServiceIdentification><ows:Title>Training WFS</ows:Title><ows:Abstract>Training Web Feature Service providing natural earth vector data and a range of examples.</ows:Abstract><ows:Keywords><ows:Keyword>WFS</ows:Keyword><ows:Keyword>WMS</ows:Keyword><ows:Keyword>GEOSERVER</ows:Keyword></ows:Keywords><ows:ServiceType>WFS</ows:ServiceType><ows:ServiceTypeVersion>1.1.0</ows:ServiceTypeVersion><ows:Fees>NONE</ows:Fees><ows:AccessConstraints>NONE</ows:AccessConstraints></ows:ServiceIdentification><ows:ServiceProvider><ows:ProviderName>Boundless</ows:ProviderName><ows:ServiceContact><ows:IndividualName>Training</ows:IndividualName><ows:PositionName/><ows:ContactInfo><ows:Phone><ows:Voice/><ows:Facsimile/></ows:Phone><ows:Address><ows:DeliveryPoint/><ows:City/><ows:AdministrativeArea/><ows:PostalCode/><ows:Country>Everywhere</ows:Country><ows:ElectronicMailAddress/></ows:Address></ows:ContactInfo></ows:ServiceContact></ows:ServiceProvider><ows:OperationsMetadata><ows:Operation name="GetCapabilities"><ows:DCP><ows:HTTP><ows:Get xlink:href="http://localhost:8080/geoserver/wfs"/><ows:Post xlink:href="http://localhost:8080/geoserver/wfs"/></ows:HTTP></ows:DCP><ows:Parameter name="AcceptVersions"><ows:Value>1.0.0</ows:Value><ows:Value>1.1.0</ows:Value></ows:Parameter><ows:Parameter name="AcceptFormats"><ows:Value>text/xml</ows:Value></ows:Parameter></ows:Operation><ows:Operation name="DescribeFeatureType"><ows:DCP><ows:HTTP><ows:Get xlink:href="http://localhost:8080/geoserver/wfs"/><ows:Post xlink:href="http://localhost:8080/geoserver/wfs"/></ows:HTTP></ows:DCP><ows:Parameter name="outputFormat"><ows:Value>text/xml; subtype=gml/3.1.1</ows:Value></ows:Parameter></ows:Operation><ows:Operation name="GetFeature"><ows:DCP><ows:HTTP><ows:Get xlink:href="http://localhost:8080/geoserver/wfs"/><ows:Post xlink:href="http://localhost:8080/geoserver/wfs"/></ows:HTTP></ows:DCP><ows:Parameter name="resultType"><ows:Value>results</ows:Value><ows:Value>hits</ows:Value></ows:Parameter><ows:Parameter name="outputFormat"><ows:Value>text/xml; subtype=gml/3.1.1</ows:Value><ows:Value>GML2</ows:Value><ows:Value>KML</ows:Value><ows:Value>SHAPE-ZIP</ows:Value><ows:Value>application/gml+xml; version=3.2</ows:Value><ows:Value>application/json</ows:Value><ows:Value>application/vnd.google-earth.kml xml</ows:Value><ows:Value>application/vnd.google-earth.kml+xml</ows:Value><ows:Value>csv</ows:Value><ows:Value>gml3</ows:Value><ows:Value>gml32</ows:Value><ows:Value>json</ows:Value><ows:Value>text/javascript</ows:Value><ows:Value>text/xml; subtype=gml/2.1.2</ows:Value><ows:Value>text/xml; subtype=gml/3.2</ows:Value></ows:Parameter><ows:Constraint name="LocalTraverseXLinkScope"><ows:Value>2</ows:Value></ows:Constraint></ows:Operation><ows:Operation name="GetGmlObject"><ows:DCP><ows:HTTP><ows:Get xlink:href="http://localhost:8080/geoserver/wfs"/><ows:Post xlink:href="http://localhost:8080/geoserver/wfs"/></ows:HTTP></ows:DCP></ows:Operation><ows:Operation name="LockFeature"><ows:DCP><ows:HTTP><ows:Get xlink:href="http://localhost:8080/geoserver/wfs"/><ows:Post xlink:href="http://localhost:8080/geoserver/wfs"/></ows:HTTP></ows:DCP><ows:Parameter name="releaseAction"><ows:Value>ALL</ows:Value><ows:Value>SOME</ows:Value></ows:Parameter></ows:Operation><ows:Operation name="GetFeatureWithLock"><ows:DCP><ows:HTTP><ows:Get xlink:href="http://localhost:8080/geoserver/wfs"/><ows:Post xlink:href="http://localhost:8080/geoserver/wfs"/></ows:HTTP></ows:DCP><ows:Parameter name="resultType"><ows:Value>results</ows:Value><ows:Value>hits</ows:Value></ows:Parameter><ows:Parameter name="outputFormat"><ows:Value>text/xml; subtype=gml/3.1.1</ows:Value><ows:Value>GML2</ows:Value><ows:Value>KML</ows:Value><ows:Value>SHAPE-ZIP</ows:Value><ows:Value>application/gml+xml; version=3.2</ows:Value><ows:Value>application/json</ows:Value><ows:Value>application/vnd.google-earth.kml xml</ows:Value><ows:Value>application/vnd.google-earth.kml+xml</ows:Value><ows:Value>csv</ows:Value><ows:Value>gml3</ows:Value><ows:Value>gml32</ows:Value><ows:Value>json</ows:Value><ows:Value>text/javascript</ows:Value><ows:Value>text/xml; subtype=gml/2.1.2</ows:Value><ows:Value>text/xml; subtype=gml/3.2</ows:Value></ows:Parameter></ows:Operation><ows:Operation name="Transaction"><ows:DCP><ows:HTTP><ows:Get xlink:href="http://localhost:8080/geoserver/wfs"/><ows:Post xlink:href="http://localhost:8080/geoserver/wfs"/></ows:HTTP></ows:DCP><ows:Parameter name="inputFormat"><ows:Value>text/xml; subtype=gml/3.1.1</ows:Value></ows:Parameter><ows:Parameter name="idgen"><ows:Value>GenerateNew</ows:Value><ows:Value>UseExisting</ows:Value><ows:Value>ReplaceDuplicate</ows:Value></ows:Parameter><ows:Parameter name="releaseAction"><ows:Value>ALL</ows:Value><ows:Value>SOME</ows:Value></ows:Parameter></ows:Operation></ows:OperationsMetadata><FeatureTypeList><Operations><Operation>Query</Operation><Operation>Insert</Operation><Operation>Update</Operation><Operation>Delete</Operation><Operation>Lock</Operation></Operations><FeatureType xmlns:ne="http://www.naturalearthdata.com"><Name>ne:urban_areas</Name><Title/><Abstract>Area of dense human habitation.</Abstract><ows:Keywords><ows:Keyword>features</ows:Keyword><ows:Keyword>ne_10m_urban_areas</ows:Keyword></ows:Keywords><DefaultSRS>urn:x-ogc:def:crs:EPSG:4326</DefaultSRS><ows:WGS84BoundingBox><ows:LowerCorner>-157.99118261729797 -51.05303741160215</ows:LowerCorner><ows:UpperCorner>178.0338339830011 69.76985509228818</ows:UpperCorner></ows:WGS84BoundingBox></FeatureType><FeatureType xmlns:ne="http://www.naturalearthdata.com"><Name>ne:boundary_lines_land</Name><Title>Boundary Lines Land</Title><Abstract>Country boundaries on land</Abstract><ows:Keywords><ows:Keyword>ne_10m_admin_0_boundary_lines_land</ows:Keyword><ows:Keyword>features</ows:Keyword></ows:Keywords><DefaultSRS>urn:x-ogc:def:crs:EPSG:4326</DefaultSRS><ows:WGS84BoundingBox><ows:LowerCorner>-180.0 -90.0</ows:LowerCorner><ows:UpperCorner>180.0 90.0</ows:UpperCorner></ows:WGS84BoundingBox></FeatureType><FeatureType xmlns:ne="http://www.naturalearthdata.com"><Name>ne:ne_10m_admin_0_countries</Name><Title>Countries of the World</Title><Abstract/><ows:Keywords><ows:Keyword>ne_10m_admin_0_countries</ows:Keyword><ows:Keyword>features</ows:Keyword></ows:Keywords><DefaultSRS>urn:x-ogc:def:crs:EPSG:4326</DefaultSRS><ows:WGS84BoundingBox><ows:LowerCorner>-179.9999999999999 -90.0</ows:LowerCorner><ows:UpperCorner>180.0000000000002 83.63410065300012</ows:UpperCorner></ows:WGS84BoundingBox></FeatureType><FeatureType xmlns:opengeo="http://opengeo.org"><Name>opengeo:countries</Name><Title>Countries of the World</Title><Abstract>The 247 countries in the world. Data courtesy of NaturalEarth.</Abstract><ows:Keywords><ows:Keyword>ne_50m_admin_0_countries</ows:Keyword><ows:Keyword>countries</ows:Keyword><ows:Keyword>features</ows:Keyword></ows:Keywords><DefaultSRS>urn:x-ogc:def:crs:EPSG:4326</DefaultSRS><ows:WGS84BoundingBox><ows:LowerCorner>-180.0 -90.0</ows:LowerCorner><ows:UpperCorner>180.0 90.0</ows:UpperCorner></ows:WGS84BoundingBox></FeatureType><FeatureType xmlns:ne="http://www.naturalearthdata.com"><Name>ne:ocean</Name><Title>Ocean</Title><Abstract>Ocean polygon split into contiguous pieces.</Abstract><ows:Keywords><ows:Keyword>ne_10m_ocean</ows:Keyword><ows:Keyword>features</ows:Keyword></ows:Keywords><DefaultSRS>urn:x-ogc:def:crs:EPSG:4326</DefaultSRS><ows:WGS84BoundingBox><ows:LowerCorner>-180.0 -90.0</ows:LowerCorner><ows:UpperCorner>180.0 90.0</ows:UpperCorner></ows:WGS84BoundingBox></FeatureType><FeatureType xmlns:ne="http://www.naturalearthdata.com"><Name>ne:populated_places</Name><Title>Populated places</Title><Abstract>City and town points, from Tokyo to Wasilla, Cairo to Kandahar</Abstract><ows:Keywords><ows:Keyword>features</ows:Keyword><ows:Keyword>populated_places</ows:Keyword></ows:Keywords><DefaultSRS>urn:x-ogc:def:crs:EPSG:4326</DefaultSRS><ows:WGS84BoundingBox><ows:LowerCorner>-180.0 -90.0</ows:LowerCorner><ows:UpperCorner>180.0 90.0</ows:UpperCorner></ows:WGS84BoundingBox></FeatureType><FeatureType xmlns:ne="http://www.naturalearthdata.com"><Name>ne:states_provinces_shp</Name><Title>States and provinces</Title><Abstract>Internal administrative boundaries.</Abstract><ows:Keywords><ows:Keyword>ne_10m_admin_1_states_provinces_shp</ows:Keyword><ows:Keyword>features</ows:Keyword></ows:Keywords><DefaultSRS>urn:x-ogc:def:crs:EPSG:4326</DefaultSRS><ows:WGS84BoundingBox><ows:LowerCorner>-180.0 -90.0</ows:LowerCorner><ows:UpperCorner>180.0 90.0</ows:UpperCorner></ows:WGS84BoundingBox></FeatureType><FeatureType xmlns:ne="http://www.naturalearthdata.com"><Name>ne:states_provinces_lines</Name><Title>States and provinces lines</Title><Abstract>Internal administrative boundaries.</Abstract><ows:Keywords><ows:Keyword>ne_10m_admin_1_states_provinces_lines_shp</ows:Keyword><ows:Keyword>features</ows:Keyword></ows:Keywords><DefaultSRS>urn:x-ogc:def:crs:EPSG:4326</DefaultSRS><ows:WGS84BoundingBox><ows:LowerCorner>-180.0 -90.0</ows:LowerCorner><ows:UpperCorner>180.0 90.0</ows:UpperCorner></ows:WGS84BoundingBox></FeatureType><FeatureType xmlns:usa="http://census.gov"><Name>usa:states</Name><Title>States of the USA</Title><Abstract>States of the United Stats of America, including the District of Columbia and Puerto Rico. Data taken from the 2010 Census.</Abstract><ows:Keywords><ows:Keyword>states</ows:Keyword><ows:Keyword>census</ows:Keyword></ows:Keywords><DefaultSRS>urn:x-ogc:def:crs:EPSG:4326</DefaultSRS><ows:WGS84BoundingBox><ows:LowerCorner>-179.23023299999997 17.831509000000036</ows:LowerCorner><ows:UpperCorner>-65.16882499999997 71.437769</ows:UpperCorner></ows:WGS84BoundingBox></FeatureType></FeatureTypeList><ogc:Filter_Capabilities><ogc:Spatial_Capabilities><ogc:GeometryOperands><ogc:GeometryOperand>gml:Envelope</ogc:GeometryOperand><ogc:GeometryOperand>gml:Point</ogc:GeometryOperand><ogc:GeometryOperand>gml:LineString</ogc:GeometryOperand><ogc:GeometryOperand>gml:Polygon</ogc:GeometryOperand></ogc:GeometryOperands><ogc:SpatialOperators><ogc:SpatialOperator name="Disjoint"/><ogc:SpatialOperator name="Equals"/><ogc:SpatialOperator name="DWithin"/><ogc:SpatialOperator name="Beyond"/><ogc:SpatialOperator name="Intersects"/><ogc:SpatialOperator name="Touches"/><ogc:SpatialOperator name="Crosses"/><ogc:SpatialOperator name="Within"/><ogc:SpatialOperator name="Contains"/><ogc:SpatialOperator name="Overlaps"/><ogc:SpatialOperator name="BBOX"/></ogc:SpatialOperators></ogc:Spatial_Capabilities><ogc:Scalar_Capabilities><ogc:LogicalOperators/><ogc:ComparisonOperators><ogc:ComparisonOperator>LessThan</ogc:ComparisonOperator><ogc:ComparisonOperator>GreaterThan</ogc:ComparisonOperator><ogc:ComparisonOperator>LessThanEqualTo</ogc:ComparisonOperator><ogc:ComparisonOperator>GreaterThanEqualTo</ogc:ComparisonOperator><ogc:ComparisonOperator>EqualTo</ogc:ComparisonOperator><ogc:ComparisonOperator>NotEqualTo</ogc:ComparisonOperator><ogc:ComparisonOperator>Like</ogc:ComparisonOperator><ogc:ComparisonOperator>Between</ogc:ComparisonOperator><ogc:ComparisonOperator>NullCheck</ogc:ComparisonOperator></ogc:ComparisonOperators><ogc:ArithmeticOperators><ogc:SimpleArithmetic/><ogc:Functions><ogc:FunctionNames><ogc:FunctionName nArgs="1">abs</ogc:FunctionName></ogc:Functions></ogc:ArithmeticOperators></ogc:Scalar_Capabilities><ogc:Id_Capabilities><ogc:FID/><ogc:EID/></ogc:Id_Capabilities></ogc:Filter_Capabilities></wfs:WFS_Capabilities>';
    var xmlhttp = {
      responseXML: ol.xml.parse(caps)
    };
    var result = WFSService.parseCapabilities(xmlhttp);
    assert.equal(result.layers.length, 9);
    assert.equal(result.layers[0].Name, 'ne:urban_areas');
    assert.equal(result.layers[0].EX_GeographicBoundingBox[0], -157.99118261729797);
    assert.equal(result.layers[0].Abstract, 'Area of dense human habitation.');
    assert.equal(result.title, 'Training WFS');
  });

});

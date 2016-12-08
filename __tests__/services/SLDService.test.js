/* global beforeEach, describe, it */

import {assert, expect} from 'chai';
import chai from 'chai';
import chaiXml from 'chai-xml';
import raf from 'raf';
import ol from 'openlayers';
import SLDService from '../../js/services/SLDService';

raf.polyfill();
chai.use(chaiXml);

describe('SLDService', function() {

  var fillColor, strokeColor;

  beforeEach(function() {
    fillColor = {
      hex: 'FF0000',
      rgb: {
        r: 255,
        g: 0,
        b: 0,
        a: 0.5
      }
    };
    strokeColor = {
      hex: 'FF0000',
      rgb: {
        r: 255,
        g: 0,
        b: 0,
        a: 0.5
      }
    };
  });

  it('creates the correct fill', function() {
    var fill = SLDService.createFill({
      fillColor: fillColor
    });
    for (var i, ii = fill.cssParameter.length; i < ii; ++i) {
      var key = fill.cssParameter[i].name;
      if (key === 'fill') {
        assert.equal(fill.cssParameter[i].content[0], '#FF0000');
      }
      if (key === 'fill-opacity') {
        assert.equal(fill.cssParameter[i].content[0], '0.5');
      }
    }
  });

  it('creates the correct stroke', function() {
    var stroke = SLDService.createStroke({
      strokeColor: strokeColor,
      strokeWidth: 2
    });
    for (var i, ii = stroke.cssParameter.length; i < ii; ++i) {
      var key = stroke.cssParameter[i].name;
      if (key === 'stroke') {
        assert.equal(stroke.cssParameter[i].content[0], '#FF0000');
      }
      if (key === 'stroke-width') {
        assert.equal(stroke.cssParameter[i].content[0], '2');
      }
      if (key === 'stroke-opacity') {
        assert.equal(stroke.cssParameter[i].content[0], '0.5');
      }
    }
  });

  it('creates a polygon symbolizer', function() {
    var symbol = SLDService.createPolygonSymbolizer({
      strokeColor: strokeColor,
      strokeWidth: 2,
      fillColor: fillColor
    });
    assert.equal(symbol.name.localPart, 'PolygonSymbolizer');
    assert.equal(symbol.value.fill !== undefined, true);
    assert.equal(symbol.value.stroke !== undefined, true);
  });

  it('creates a line symbolizer', function() {
    var symbol = SLDService.createLineSymbolizer({
      strokeColor: strokeColor,
      strokeWidth: 2
    });
    assert.equal(symbol.name.localPart, 'LineSymbolizer');
    assert.equal(symbol.value.fill === undefined, true);
    assert.equal(symbol.value.stroke !== undefined, true);
  });

  it('creates a point symbolizer', function() {
    var symbol = SLDService.createPointSymbolizer({
      strokeColor: strokeColor,
      fillColor: fillColor,
      symbolType: 'circle',
      symbolSize: '4'
    });
    assert.equal(symbol.name.localPart, 'PointSymbolizer');
    assert.equal(symbol.value.graphic.externalGraphicOrMark[0].wellKnownName, 'circle');
    assert.equal(symbol.value.graphic.externalGraphicOrMark[0].fill !== undefined, true);
    assert.equal(symbol.value.graphic.externalGraphicOrMark[0].stroke !== undefined, true);
    assert.equal(symbol.value.graphic.size.content[0], '4');
  });

  it('roundtrips PointSymbolizer ExternalGraphic', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Default Styler</sld:Name><sld:UserStyle><sld:Name>Default Styler</sld:Name><sld:FeatureTypeStyle><sld:Name>name</sld:Name><sld:Rule><sld:Name>rule1</sld:Name><sld:PointSymbolizer><sld:Graphic><sld:ExternalGraphic><sld:OnlineResource xlink:href="https://cdn1.iconfinder.com/data/icons/Map-Markers-Icons-Demo-PNG/128/Map-Marker-Marker-Outside-Azure.png"/><sld:Format>image/png</sld:Format></sld:ExternalGraphic><sld:Size>20</sld:Size><sld:Rotation>90.0</sld:Rotation></sld:Graphic></sld:PointSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Default Styler', styleInfo: info}), 'Point', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips SLD Cook Book: Simple Point', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Simple Point</sld:Name><sld:UserStyle><sld:Title>SLD Cook Book: Simple Point</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:PointSymbolizer><sld:Graphic><sld:Mark><sld:WellKnownName>circle</sld:WellKnownName><sld:Fill><sld:CssParameter name="fill">#FF0000</sld:CssParameter></sld:Fill></sld:Mark><sld:Size>6</sld:Size></sld:Graphic></sld:PointSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Simple Point', styleInfo: info}), 'Point', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Simple point with stroke', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Simple point with stroke</sld:Name><sld:UserStyle><sld:Title>GeoServer SLD Cook Book: Simple point with stroke</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:PointSymbolizer><sld:Graphic><sld:Mark><sld:WellKnownName>circle</sld:WellKnownName><sld:Fill><sld:CssParameter name="fill">#FF0000</sld:CssParameter></sld:Fill><sld:Stroke><sld:CssParameter name="stroke">#000000</sld:CssParameter><sld:CssParameter name="stroke-width">2</sld:CssParameter></sld:Stroke></sld:Mark><sld:Size>6</sld:Size></sld:Graphic></sld:PointSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Simple point with stroke', styleInfo: info}), 'Point', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Rotated square', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Rotated square</sld:Name><sld:UserStyle><sld:Title>GeoServer SLD Cook Book: Rotated square</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:PointSymbolizer><sld:Graphic><sld:Mark><sld:WellKnownName>square</sld:WellKnownName><sld:Fill><sld:CssParameter name="fill">#009900</sld:CssParameter></sld:Fill></sld:Mark><sld:Size>12</sld:Size><sld:Rotation>45</sld:Rotation></sld:Graphic></sld:PointSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Rotated square', styleInfo: info}), 'Point', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Transparent triangle', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Transparent triangle</sld:Name><sld:UserStyle><sld:Title>GeoServer SLD Cook Book: Transparent triangle</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:PointSymbolizer><sld:Graphic><sld:Mark><sld:WellKnownName>triangle</sld:WellKnownName><sld:Fill><sld:CssParameter name="fill">#009900</sld:CssParameter><sld:CssParameter name="fill-opacity">0.2</sld:CssParameter></sld:Fill><sld:Stroke><sld:CssParameter name="stroke">#000000</sld:CssParameter><sld:CssParameter name="stroke-width">2</sld:CssParameter></sld:Stroke></sld:Mark><sld:Size>12</sld:Size></sld:Graphic></sld:PointSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Transparent triangle', styleInfo: info}), 'Point', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Point as graphic', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Point as graphic</sld:Name><sld:UserStyle><sld:Title>GeoServer SLD Cook Book: Point as graphic</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:PointSymbolizer><sld:Graphic><sld:ExternalGraphic><sld:OnlineResource xlink:href="smileyface.png"/><sld:Format>image/png</sld:Format></sld:ExternalGraphic><sld:Size>32</sld:Size></sld:Graphic></sld:PointSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Point as graphic', styleInfo: info}), 'Point', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Point with default label', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Point with default label</sld:Name><sld:UserStyle><sld:Title>GeoServer SLD Cook Book: Point with default label</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:PointSymbolizer><sld:Graphic><sld:Mark><sld:WellKnownName>circle</sld:WellKnownName><sld:Fill><sld:CssParameter name="fill">#FF0000</sld:CssParameter></sld:Fill></sld:Mark><sld:Size>6</sld:Size></sld:Graphic></sld:PointSymbolizer><sld:TextSymbolizer><sld:Label><ogc:PropertyName>name</ogc:PropertyName></sld:Label><sld:Fill><sld:CssParameter name="fill">#000000</sld:CssParameter></sld:Fill></sld:TextSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Point with default label', styleInfo: info}), 'Point', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Point with styled label', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Point with styled label</sld:Name><sld:UserStyle><sld:Title>GeoServer SLD Cook Book: Point with styled label</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:PointSymbolizer><sld:Graphic><sld:Mark><sld:WellKnownName>circle</sld:WellKnownName><sld:Fill><sld:CssParameter name="fill">#FF0000</sld:CssParameter></sld:Fill></sld:Mark><sld:Size>6</sld:Size></sld:Graphic></sld:PointSymbolizer><sld:TextSymbolizer><sld:Label><ogc:PropertyName>name</ogc:PropertyName></sld:Label><sld:Font><sld:CssParameter name="font-family">Arial</sld:CssParameter><sld:CssParameter name="font-size">12</sld:CssParameter><sld:CssParameter name="font-style">normal</sld:CssParameter><sld:CssParameter name="font-weight">bold</sld:CssParameter></sld:Font><sld:LabelPlacement><sld:PointPlacement><sld:AnchorPoint><sld:AnchorPointX>0.5</sld:AnchorPointX><sld:AnchorPointY>0.0</sld:AnchorPointY></sld:AnchorPoint><sld:Displacement><sld:DisplacementX>0</sld:DisplacementX><sld:DisplacementY>5</sld:DisplacementY></sld:Displacement></sld:PointPlacement></sld:LabelPlacement><sld:Fill><sld:CssParameter name="fill">#000000</sld:CssParameter></sld:Fill></sld:TextSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Point with styled label', styleInfo: info}), 'Point', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Point with rotated label', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Point with rotated label</sld:Name><sld:UserStyle><sld:Title>GeoServer SLD Cook Book: Point with rotated label</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:PointSymbolizer><sld:Graphic><sld:Mark><sld:WellKnownName>circle</sld:WellKnownName><sld:Fill><sld:CssParameter name="fill">#FF0000</sld:CssParameter></sld:Fill></sld:Mark><sld:Size>6</sld:Size></sld:Graphic></sld:PointSymbolizer><sld:TextSymbolizer><sld:Label><ogc:PropertyName>name</ogc:PropertyName></sld:Label><sld:Font><sld:CssParameter name="font-family">Arial</sld:CssParameter><sld:CssParameter name="font-size">12</sld:CssParameter><sld:CssParameter name="font-style">normal</sld:CssParameter><sld:CssParameter name="font-weight">bold</sld:CssParameter></sld:Font><sld:LabelPlacement><sld:PointPlacement><sld:AnchorPoint><sld:AnchorPointX>0.5</sld:AnchorPointX><sld:AnchorPointY>0.0</sld:AnchorPointY></sld:AnchorPoint><sld:Displacement><sld:DisplacementX>0</sld:DisplacementX><sld:DisplacementY>25</sld:DisplacementY></sld:Displacement><sld:Rotation>-45</sld:Rotation></sld:PointPlacement></sld:LabelPlacement><sld:Fill><sld:CssParameter name="fill">#990099</sld:CssParameter></sld:Fill></sld:TextSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Point with rotated label', styleInfo: info}), 'Point', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Attribute-based point', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Attribute-based point</sld:Name><sld:UserStyle><sld:Title>GeoServer SLD Cook Book: Attribute-based point</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:Name>SmallPop</sld:Name><sld:Title>1 to 50000</sld:Title><ogc:Filter><ogc:PropertyIsLessThan><ogc:PropertyName>pop</ogc:PropertyName><ogc:Literal>50000</ogc:Literal></ogc:PropertyIsLessThan></ogc:Filter><sld:PointSymbolizer><sld:Graphic><sld:Mark><sld:WellKnownName>circle</sld:WellKnownName><sld:Fill><sld:CssParameter name="fill">#0033CC</sld:CssParameter></sld:Fill></sld:Mark><sld:Size>8</sld:Size></sld:Graphic></sld:PointSymbolizer></sld:Rule><sld:Rule><sld:Name>MediumPop</sld:Name><sld:Title>50000 to 100000</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsGreaterThanOrEqualTo><ogc:PropertyName>pop</ogc:PropertyName><ogc:Literal>50000</ogc:Literal></ogc:PropertyIsGreaterThanOrEqualTo><ogc:PropertyIsLessThan><ogc:PropertyName>pop</ogc:PropertyName><ogc:Literal>100000</ogc:Literal></ogc:PropertyIsLessThan></ogc:And></ogc:Filter><sld:PointSymbolizer><sld:Graphic><sld:Mark><sld:WellKnownName>circle</sld:WellKnownName><sld:Fill><sld:CssParameter name="fill">#0033CC</sld:CssParameter></sld:Fill></sld:Mark><sld:Size>12</sld:Size></sld:Graphic></sld:PointSymbolizer></sld:Rule><sld:Rule><sld:Name>LargePop</sld:Name><sld:Title>Greater than 100000</sld:Title><ogc:Filter><ogc:PropertyIsGreaterThanOrEqualTo><ogc:PropertyName>pop</ogc:PropertyName><ogc:Literal>100000</ogc:Literal></ogc:PropertyIsGreaterThanOrEqualTo></ogc:Filter><sld:PointSymbolizer><sld:Graphic><sld:Mark><sld:WellKnownName>circle</sld:WellKnownName><sld:Fill><sld:CssParameter name="fill">#0033CC</sld:CssParameter></sld:Fill></sld:Mark><sld:Size>16</sld:Size></sld:Graphic></sld:PointSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Attribute-based point', styleInfo: info}), 'Point', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Zoom-based point', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Zoom-based point</sld:Name><sld:UserStyle><sld:Title>GeoServer SLD Cook Book: Zoom-based point</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:Name>Large</sld:Name><sld:MaxScaleDenominator>160000000</sld:MaxScaleDenominator><sld:PointSymbolizer><sld:Graphic><sld:Mark><sld:WellKnownName>circle</sld:WellKnownName><sld:Fill><sld:CssParameter name="fill">#CC3300</sld:CssParameter></sld:Fill></sld:Mark><sld:Size>12</sld:Size></sld:Graphic></sld:PointSymbolizer></sld:Rule><sld:Rule><sld:Name>Medium</sld:Name><sld:MinScaleDenominator>160000000</sld:MinScaleDenominator><sld:MaxScaleDenominator>320000000</sld:MaxScaleDenominator><sld:PointSymbolizer><sld:Graphic><sld:Mark><sld:WellKnownName>circle</sld:WellKnownName><sld:Fill><sld:CssParameter name="fill">#CC3300</sld:CssParameter></sld:Fill></sld:Mark><sld:Size>8</sld:Size></sld:Graphic></sld:PointSymbolizer></sld:Rule><sld:Rule><sld:Name>Small</sld:Name><sld:MinScaleDenominator>320000000</sld:MinScaleDenominator><sld:PointSymbolizer><sld:Graphic><sld:Mark><sld:WellKnownName>circle</sld:WellKnownName><sld:Fill><sld:CssParameter name="fill">#CC3300</sld:CssParameter></sld:Fill></sld:Mark><sld:Size>4</sld:Size></sld:Graphic></sld:PointSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Zoom-based point', styleInfo: info}), 'Point', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Simple Line', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Simple Line</sld:Name><sld:UserStyle><sld:Title>SLD Cook Book: Simple Line</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:LineSymbolizer><sld:Stroke><sld:CssParameter name="stroke">#000000</sld:CssParameter><sld:CssParameter name="stroke-width">3</sld:CssParameter></sld:Stroke></sld:LineSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Simple Line', styleInfo: info}), 'LineString', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Line with border', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Line with border</sld:Name><sld:UserStyle><sld:Title>SLD Cook Book: Line w2th border</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:LineSymbolizer><sld:Stroke><sld:CssParameter name="stroke">#333333</sld:CssParameter><sld:CssParameter name="stroke-width">5</sld:CssParameter><sld:CssParameter name="stroke-linecap">round</sld:CssParameter></sld:Stroke></sld:LineSymbolizer></sld:Rule></sld:FeatureTypeStyle><sld:FeatureTypeStyle><sld:Rule><sld:LineSymbolizer><sld:Stroke><sld:CssParameter name="stroke">#6699FF</sld:CssParameter><sld:CssParameter name="stroke-width">3</sld:CssParameter><sld:CssParameter name="stroke-linecap">round</sld:CssParameter></sld:Stroke></sld:LineSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Line with border', styleInfo: info}), 'LineString', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Dashed line', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Dashed line</sld:Name><sld:UserStyle><sld:Title>SLD Cook Book: Dashed line</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:LineSymbolizer><sld:Stroke><sld:CssParameter name="stroke">#0000FF</sld:CssParameter><sld:CssParameter name="stroke-width">3</sld:CssParameter><sld:CssParameter name="stroke-dasharray">5 2</sld:CssParameter></sld:Stroke></sld:LineSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Dashed line', styleInfo: info}), 'LineString', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  // TODO uncomment PerpendicularOffset, needs fix for https://github.com/highsource/ogc-schemas/issues/185
  it('roundtrips GeoServer SLD Cook Book: Offset line', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Dashed line</sld:Name><sld:UserStyle><sld:Title>SLD Cook Book: Offset line</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:LineSymbolizer><sld:Stroke><sld:CssParameter name="stroke">#000000</sld:CssParameter></sld:Stroke></sld:LineSymbolizer><sld:LineSymbolizer><sld:Stroke><sld:CssParameter name="stroke">#FF0000</sld:CssParameter><sld:CssParameter name="stroke-dasharray">5 2</sld:CssParameter></sld:Stroke><!--<sld:PerpendicularOffset>5</sld:PerpendicularOffset>--></sld:LineSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Dashed line', styleInfo: info}), 'LineString', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Railroad (hatching)', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Railroad (hatching)</sld:Name><sld:UserStyle><sld:Title>SLD Cook Book: Railroad (hatching)</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:LineSymbolizer><sld:Stroke><sld:CssParameter name="stroke">#333333</sld:CssParameter><sld:CssParameter name="stroke-width">3</sld:CssParameter></sld:Stroke></sld:LineSymbolizer><sld:LineSymbolizer><sld:Stroke><sld:GraphicStroke><sld:Graphic><sld:Mark><sld:WellKnownName>shape://vertline</sld:WellKnownName><sld:Stroke><sld:CssParameter name="stroke">#333333</sld:CssParameter><sld:CssParameter name="stroke-width">1</sld:CssParameter></sld:Stroke></sld:Mark><sld:Size>12</sld:Size></sld:Graphic></sld:GraphicStroke></sld:Stroke></sld:LineSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Railroad (hatching)', styleInfo: info}), 'LineString', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Dash/Space line', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Dash - symbol and space</sld:Name><sld:UserStyle><sld:Title>SLD Cook Book: Dash/Space line</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:LineSymbolizer><sld:Stroke><sld:GraphicStroke><sld:Graphic><sld:Mark><sld:WellKnownName>circle</sld:WellKnownName><sld:Fill><sld:CssParameter name="fill">#666666</sld:CssParameter></sld:Fill><sld:Stroke><sld:CssParameter name="stroke">#333333</sld:CssParameter><sld:CssParameter name="stroke-width">1</sld:CssParameter></sld:Stroke></sld:Mark><sld:Size>4</sld:Size></sld:Graphic></sld:GraphicStroke><sld:CssParameter name="stroke-dasharray">4 6</sld:CssParameter></sld:Stroke></sld:LineSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Dash - symbol and space', styleInfo: info}), 'LineString', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Dash/Symbol line', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Dash - symbol</sld:Name><sld:UserStyle><sld:Title>SLD Cook Book: Dash/Symbol line</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:LineSymbolizer><sld:Stroke><sld:CssParameter name="stroke">#0000FF</sld:CssParameter><sld:CssParameter name="stroke-width">1</sld:CssParameter><sld:CssParameter name="stroke-dasharray">10 10</sld:CssParameter></sld:Stroke></sld:LineSymbolizer><sld:LineSymbolizer><sld:Stroke><sld:GraphicStroke><sld:Graphic><sld:Mark><sld:WellKnownName>circle</sld:WellKnownName><sld:Stroke><sld:CssParameter name="stroke">#000033</sld:CssParameter><sld:CssParameter name="stroke-width">1</sld:CssParameter></sld:Stroke></sld:Mark><sld:Size>5</sld:Size></sld:Graphic></sld:GraphicStroke><sld:CssParameter name="stroke-dasharray">5 15</sld:CssParameter><sld:CssParameter name="stroke-dashoffset">7.5</sld:CssParameter></sld:Stroke></sld:LineSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Dash - symbol', styleInfo: info}), 'LineString', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Line with default label', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Line with default label</sld:Name><sld:UserStyle><sld:Title>SLD Cook Book: Line with default label</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:LineSymbolizer><sld:Stroke><sld:CssParameter name="stroke">#FF0000</sld:CssParameter></sld:Stroke></sld:LineSymbolizer><sld:TextSymbolizer><sld:Label><ogc:PropertyName>name</ogc:PropertyName></sld:Label><sld:Fill><sld:CssParameter name="fill">#000000</sld:CssParameter></sld:Fill></sld:TextSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Line with default label', styleInfo: info}), 'LineString', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Label following line', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Label following line</sld:Name><sld:UserStyle><sld:Title>SLD Cook Book: Label following line</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:LineSymbolizer><sld:Stroke><sld:CssParameter name="stroke">#FF0000</sld:CssParameter></sld:Stroke></sld:LineSymbolizer><sld:TextSymbolizer><sld:Label><ogc:PropertyName>name</ogc:PropertyName></sld:Label><sld:LabelPlacement><sld:LinePlacement/></sld:LabelPlacement><sld:Fill><sld:CssParameter name="fill">#000000</sld:CssParameter></sld:Fill><sld:VendorOption name="followLine">true</sld:VendorOption></sld:TextSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Label following line', styleInfo: info}), 'LineString', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Optimized label placement', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Optimized label placement</sld:Name><sld:UserStyle><sld:Title>SLD Cook Book: Optimized label placement</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:LineSymbolizer><sld:Stroke><sld:CssParameter name="stroke">#FF0000</sld:CssParameter></sld:Stroke></sld:LineSymbolizer><sld:TextSymbolizer><sld:Label><ogc:PropertyName>name</ogc:PropertyName></sld:Label><sld:LabelPlacement><sld:LinePlacement/></sld:LabelPlacement><sld:Fill><sld:CssParameter name="fill">#000000</sld:CssParameter></sld:Fill><sld:VendorOption name="followLine">true</sld:VendorOption><sld:VendorOption name="maxAngleDelta">90</sld:VendorOption><sld:VendorOption name="maxDisplacement">400</sld:VendorOption><sld:VendorOption name="repeat">150</sld:VendorOption></sld:TextSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Optimized label placement', styleInfo: info}), 'LineString', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Optimized and styled label', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Optimized and styled label</sld:Name><sld:UserStyle><sld:Title>SLD Cook Book: Optimized and styled label</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:LineSymbolizer><sld:Stroke><sld:CssParameter name="stroke">#FF0000</sld:CssParameter></sld:Stroke></sld:LineSymbolizer><sld:TextSymbolizer><sld:Label><ogc:PropertyName>name</ogc:PropertyName></sld:Label><sld:Font><sld:CssParameter name="font-family">Arial</sld:CssParameter><sld:CssParameter name="font-size">10</sld:CssParameter><sld:CssParameter name="font-style">normal</sld:CssParameter><sld:CssParameter name="font-weight">bold</sld:CssParameter></sld:Font><sld:LabelPlacement><sld:LinePlacement/></sld:LabelPlacement><sld:Fill><sld:CssParameter name="fill">#000000</sld:CssParameter></sld:Fill><sld:VendorOption name="followLine">true</sld:VendorOption><sld:VendorOption name="maxAngleDelta">90</sld:VendorOption><sld:VendorOption name="maxDisplacement">400</sld:VendorOption><sld:VendorOption name="repeat">150</sld:VendorOption></sld:TextSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Optimized and styled label', styleInfo: info}), 'LineString', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Attribute-based line', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Attribute-based line</sld:Name><sld:UserStyle><sld:Title>SLD Cook Book: Attribute-based line</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:Name>local-road</sld:Name><ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>type</ogc:PropertyName><ogc:Literal>local-road</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter><sld:LineSymbolizer><sld:Stroke><sld:CssParameter name="stroke">#009933</sld:CssParameter><sld:CssParameter name="stroke-width">2</sld:CssParameter></sld:Stroke></sld:LineSymbolizer></sld:Rule></sld:FeatureTypeStyle><sld:FeatureTypeStyle><sld:Rule><sld:Name>secondary</sld:Name><ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>type</ogc:PropertyName><ogc:Literal>secondary</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter><sld:LineSymbolizer><sld:Stroke><sld:CssParameter name="stroke">#0055CC</sld:CssParameter><sld:CssParameter name="stroke-width">3</sld:CssParameter></sld:Stroke></sld:LineSymbolizer></sld:Rule></sld:FeatureTypeStyle><sld:FeatureTypeStyle><sld:Rule><sld:Name>highway</sld:Name><ogc:Filter><ogc:PropertyIsEqualTo><ogc:PropertyName>type</ogc:PropertyName><ogc:Literal>highway</ogc:Literal></ogc:PropertyIsEqualTo></ogc:Filter><sld:LineSymbolizer><sld:Stroke><sld:CssParameter name="stroke">#FF0000</sld:CssParameter><sld:CssParameter name="stroke-width">6</sld:CssParameter></sld:Stroke></sld:LineSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Attribute-based line', styleInfo: info}), 'LineString', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Zoom-based line', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Zoom-based line</sld:Name><sld:UserStyle><sld:Title>SLD Cook Book: Zoom-based line</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:Name>Large</sld:Name><sld:MaxScaleDenominator>180000000</sld:MaxScaleDenominator><sld:LineSymbolizer><sld:Stroke><sld:CssParameter name="stroke">#009933</sld:CssParameter><sld:CssParameter name="stroke-width">6</sld:CssParameter></sld:Stroke></sld:LineSymbolizer></sld:Rule><sld:Rule><sld:Name>Medium</sld:Name><sld:MinScaleDenominator>180000000</sld:MinScaleDenominator><sld:MaxScaleDenominator>360000000</sld:MaxScaleDenominator><sld:LineSymbolizer><sld:Stroke><sld:CssParameter name="stroke">#009933</sld:CssParameter><sld:CssParameter name="stroke-width">4</sld:CssParameter></sld:Stroke></sld:LineSymbolizer></sld:Rule><sld:Rule><sld:Name>Small</sld:Name><sld:MinScaleDenominator>360000000</sld:MinScaleDenominator><sld:LineSymbolizer><sld:Stroke><sld:CssParameter name="stroke">#009933</sld:CssParameter><sld:CssParameter name="stroke-width">2</sld:CssParameter></sld:Stroke></sld:LineSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Zoom-based line', styleInfo: info}), 'LineString', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Simple polygon', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Simple polygon</sld:Name><sld:UserStyle><sld:Title>SLD Cook Book: Simple polygon</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#000080</sld:CssParameter></sld:Fill></sld:PolygonSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Simple polygon', styleInfo: info}), 'Polygon', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Simple polygon with stroke', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Simple polygon with stroke</sld:Name><sld:UserStyle><sld:Title>SLD Cook Book: Simple polygon with stroke</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#000080</sld:CssParameter></sld:Fill><sld:Stroke><sld:CssParameter name="stroke">#FFFFFF</sld:CssParameter><sld:CssParameter name="stroke-width">2</sld:CssParameter></sld:Stroke></sld:PolygonSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Simple polygon with stroke', styleInfo: info}), 'Polygon', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Transparent polygon', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Transparent polygon</sld:Name><sld:UserStyle><sld:Title>SLD Cook Book: Transparent polygon</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#000080</sld:CssParameter><sld:CssParameter name="fill-opacity">0.5</sld:CssParameter></sld:Fill><sld:Stroke><sld:CssParameter name="stroke">#FFFFFF</sld:CssParameter><sld:CssParameter name="stroke-width">2</sld:CssParameter></sld:Stroke></sld:PolygonSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Transparent polygon', styleInfo: info}), 'Polygon', info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  // TODO uncomment PerpendicularOffset, needs fix for https://github.com/highsource/ogc-schemas/issues/185
  it('roundtrips GeoServer SLD Cook Book: Offset line', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Dashed line</sld:Name><sld:UserStyle><sld:Title>SLD Cook Book: Offset line</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:PolygonSymbolizer><sld:Stroke><sld:CssParameter name="stroke">#000000</sld:CssParameter><sld:CssParameter name="stroke-width">2</sld:CssParameter></sld:Stroke></sld:PolygonSymbolizer><sld:LineSymbolizer><sld:Stroke><sld:CssParameter name="stroke">#AAAAAA</sld:CssParameter><sld:CssParameter name="stroke-width">3</sld:CssParameter></sld:Stroke><!--<sld:PerpendicularOffset>-2</sld:PerpendicularOffset>--></sld:LineSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Dashed line', styleInfo: info}), undefined, info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Graphic fill', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Graphic fill</sld:Name><sld:UserStyle><sld:Title>SLD Cook Book: Graphic fill</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:PolygonSymbolizer><sld:Fill><sld:GraphicFill><sld:Graphic><sld:ExternalGraphic><sld:OnlineResource xlink:href="colorblocks.png"/><sld:Format>image/png</sld:Format></sld:ExternalGraphic><sld:Size>93</sld:Size></sld:Graphic></sld:GraphicFill></sld:Fill></sld:PolygonSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Graphic fill', styleInfo: info}), undefined, info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Hatching fill', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Hatching fill</sld:Name><sld:UserStyle><sld:Title>SLD Cook Book: Hatching fill</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:PolygonSymbolizer><sld:Fill><sld:GraphicFill><sld:Graphic><sld:Mark><sld:WellKnownName>shape://times</sld:WellKnownName><sld:Stroke><sld:CssParameter name="stroke">#990099</sld:CssParameter><sld:CssParameter name="stroke-width">1</sld:CssParameter></sld:Stroke></sld:Mark><sld:Size>16</sld:Size></sld:Graphic></sld:GraphicFill></sld:Fill></sld:PolygonSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Hatching fill', styleInfo: info}), undefined, info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Polygon with default label', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Polygon with default label</sld:Name><sld:UserStyle><sld:Title>SLD Cook Book: Polygon with default label</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#40FF40</sld:CssParameter></sld:Fill><sld:Stroke><sld:CssParameter name="stroke">#FFFFFF</sld:CssParameter><sld:CssParameter name="stroke-width">2</sld:CssParameter></sld:Stroke></sld:PolygonSymbolizer><sld:TextSymbolizer><sld:Label><ogc:PropertyName>name</ogc:PropertyName></sld:Label></sld:TextSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Polygon with default label', styleInfo: info}), undefined, info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Label halo', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Label halo</sld:Name><sld:UserStyle><sld:Title>SLD Cook Book: Label halo</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#40FF40</sld:CssParameter></sld:Fill><sld:Stroke><sld:CssParameter name="stroke">#FFFFFF</sld:CssParameter><sld:CssParameter name="stroke-width">2</sld:CssParameter></sld:Stroke></sld:PolygonSymbolizer><sld:TextSymbolizer><sld:Label><ogc:PropertyName>name</ogc:PropertyName></sld:Label><sld:Halo><sld:Radius>3</sld:Radius><sld:Fill><sld:CssParameter name="fill">#FFFFFF</sld:CssParameter></sld:Fill></sld:Halo></sld:TextSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Label halo', styleInfo: info}), undefined, info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Polygon with styled label', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Polygon with styled label</sld:Name><sld:UserStyle><sld:Title>SLD Cook Book: Polygon with styled label</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#40FF40</sld:CssParameter></sld:Fill><sld:Stroke><sld:CssParameter name="stroke">#FFFFFF</sld:CssParameter><sld:CssParameter name="stroke-width">2</sld:CssParameter></sld:Stroke></sld:PolygonSymbolizer><sld:TextSymbolizer><sld:Label><ogc:PropertyName>name</ogc:PropertyName></sld:Label><sld:Font><sld:CssParameter name="font-family">Arial</sld:CssParameter><sld:CssParameter name="font-size">11</sld:CssParameter><sld:CssParameter name="font-style">normal</sld:CssParameter><sld:CssParameter name="font-weight">bold</sld:CssParameter></sld:Font><sld:LabelPlacement><sld:PointPlacement><sld:AnchorPoint><sld:AnchorPointX>0.5</sld:AnchorPointX><sld:AnchorPointY>0.5</sld:AnchorPointY></sld:AnchorPoint></sld:PointPlacement></sld:LabelPlacement><sld:Fill><sld:CssParameter name="fill">#000000</sld:CssParameter></sld:Fill><sld:VendorOption name="autoWrap">60</sld:VendorOption><sld:VendorOption name="maxDisplacement">150</sld:VendorOption></sld:TextSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Polygon with styled label', styleInfo: info}), undefined, info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips GeoServer SLD Cook Book: Attribute-based polygon', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>Attribute-based polygon</sld:Name><sld:UserStyle><sld:Title>SLD Cook Book: Attribute-based polygon</sld:Title><sld:FeatureTypeStyle><sld:Rule><sld:Name>SmallPop</sld:Name><sld:Title>Less Than 200,000</sld:Title><ogc:Filter><ogc:PropertyIsLessThan><ogc:PropertyName>pop</ogc:PropertyName><ogc:Literal>200000</ogc:Literal></ogc:PropertyIsLessThan></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#66FF66</sld:CssParameter></sld:Fill></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Name>MediumPop</sld:Name><sld:Title>200,000 to 500,000</sld:Title><ogc:Filter><ogc:And><ogc:PropertyIsGreaterThanOrEqualTo><ogc:PropertyName>pop</ogc:PropertyName><ogc:Literal>200000</ogc:Literal></ogc:PropertyIsGreaterThanOrEqualTo><ogc:PropertyIsLessThan><ogc:PropertyName>pop</ogc:PropertyName><ogc:Literal>500000</ogc:Literal></ogc:PropertyIsLessThan></ogc:And></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#33CC33</sld:CssParameter></sld:Fill></sld:PolygonSymbolizer></sld:Rule><sld:Rule><sld:Name>LargePop</sld:Name><sld:Title>Greater Than 500,000</sld:Title><ogc:Filter><ogc:PropertyIsGreaterThan><ogc:PropertyName>pop</ogc:PropertyName><ogc:Literal>500000</ogc:Literal></ogc:PropertyIsGreaterThan></ogc:Filter><sld:PolygonSymbolizer><sld:Fill><sld:CssParameter name="fill">#009900</sld:CssParameter></sld:Fill></sld:PolygonSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'Attribute-based polygon', styleInfo: info}), undefined, info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('roundtrips vendor options in TextSymbolizer', function() {
    var sld = '<sld:StyledLayerDescriptor xmlns:sld="http://www.opengis.net/sld" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:ogc="http://www.opengis.net/ogc" version="1.0.0"><sld:NamedLayer><sld:Name>ne:populated_places</sld:Name><sld:UserStyle><sld:Name>populated_places</sld:Name><sld:FeatureTypeStyle><sld:Name>name</sld:Name><sld:Rule><sld:Name>Untitled 1</sld:Name><sld:TextSymbolizer><sld:Label><ogc:PropertyName>NAME</ogc:PropertyName></sld:Label><sld:VendorOption name="conflictResolution">true</sld:VendorOption><sld:VendorOption name="group">yes</sld:VendorOption></sld:TextSymbolizer></sld:Rule></sld:FeatureTypeStyle></sld:UserStyle></sld:NamedLayer></sld:StyledLayerDescriptor>';
    var info = SLDService.parse(sld);
    var sld2 = SLDService.createSLD(new ol.layer.Layer({id: 'ne:populated_places', styleInfo: info}), undefined, info.featureTypeStyles);
    expect(sld).xml.to.equal(sld2);
  });

  it('deals with optional values in createTextSymbolizer', function() {
    var error = false;
    try {
      SLDService.createTextSymbolizer({labelAttribute: 'NAME'});
    } catch (e) {
      error = true;
    }
    assert.equal(error, false);
  });

});

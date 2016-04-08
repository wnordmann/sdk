import {doGET} from '../util.js';
import {Jsonix} from 'jsonix';
import {XSD_1_0} from '../../node_modules/w3c-schemas/lib/XSD_1_0.js';
import {XLink_1_0} from '../../node_modules/w3c-schemas/lib/XLink_1_0.js';
import {OWS_1_0_0} from '../../node_modules/ogc-schemas/lib/OWS_1_0_0.js';
import {Filter_1_1_0} from '../../node_modules/ogc-schemas/lib/Filter_1_1_0.js';
import {SMIL_2_0} from '../../node_modules/ogc-schemas/lib/SMIL_2_0.js';
import {SMIL_2_0_Language} from '../../node_modules/ogc-schemas/lib/SMIL_2_0_Language.js';
import {GML_3_1_1} from '../../node_modules/ogc-schemas/lib/GML_3_1_1.js';
import {WFS_1_1_0} from '../../node_modules/ogc-schemas/lib/WFS_1_1_0.js';

const wfsContext = new Jsonix.Context([OWS_1_0_0, Filter_1_1_0, SMIL_2_0, SMIL_2_0_Language, XLink_1_0, GML_3_1_1, WFS_1_1_0]);
const wfsUnmarshaller = wfsContext.createUnmarshaller();
const xsdContext = new Jsonix.Context([XSD_1_0]);
const xsdUnmarshaller = xsdContext.createUnmarshaller();

class WFSService {
  getCapabilities(url, onSuccess, onFailure) {
    var layers = [];
    doGET(url, function(xmlhttp) {
      var info = wfsUnmarshaller.unmarshalDocument(xmlhttp.responseXML).value;
      if (info && info.featureTypeList && info.featureTypeList.featureType) {
        for (var i = 0, ii = info.featureTypeList.featureType.length; i < ii; ++i) {
          var ft = info.featureTypeList.featureType[i];
          var layer = {};
          layer.Name = ft.name.prefix + ':' + ft.name.localPart;
          layer.Title = ft.title;
          layer.Abstract = ft._abstract;
          layer.EX_GeographicBoundingBox = [
            ft.wgs84BoundingBox[0].lowerCorner[0],
            ft.wgs84BoundingBox[0].lowerCorner[1],
            ft.wgs84BoundingBox[0].upperCorner[0],
            ft.wgs84BoundingBox[0].upperCorner[1]
          ];
          layers.push(layer);
        }
      }
      onSuccess.call(this, {Title: info.serviceIdentification.title, Layer: layers});
    }, function(xmlhttp) {
      onFailure.call(this, xmlhttp);
    }, this);
  }
  describeFeatureType(url, layer, onSuccess, onFailure) {
    var dftUrl = url.replace('wms', 'wfs') + 'service=WFS&request=DescribeFeatureType&version=1.0.0&typename=' + layer.Name;
    doGET(dftUrl, function(xmlhttp) {
      if (xmlhttp.responseText.indexOf('ServiceExceptionReport') === -1) {
        var schema = xsdUnmarshaller.unmarshalString(xmlhttp.responseText).value;
        var element = schema.complexType[0].complexContent.extension.sequence.element;
        var geometryType, geometryName;
        var attributes = [];
        for (var i = 0, ii = element.length; i < ii; ++i) {
          var el = element[i];
          if (el.type.namespaceURI === 'http://www.opengis.net/gml') {
            geometryName = el.name;
            var lp = el.type.localPart;
            geometryType = lp.replace('PropertyType', '');
          } else if (el.name !== 'boundedBy') {
            // TODO if needed, use attribute type as well
            attributes.push(el.name);
          }
        }
        attributes.sort(function(a, b) {
          return a.toLowerCase().localeCompare(b.toLowerCase());
        });
        onSuccess.call(this, {
          featureNS: schema.targetNamespace,
          featurePrefix: layer.Name.split(':').shift(),
          featureType: schema.element[0].name,
          geometryType: geometryType,
          geometryName: geometryName,
          attributes: attributes,
          url: url.replace('wms', 'wfs')
        });
      }
    }, function(xmlhttp) {
      onFailure.call(this);
    }, this);
  }
}

export default new WFSService();

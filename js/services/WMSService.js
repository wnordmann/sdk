import {doGET} from '../util.js';
import ol from 'openlayers';

const wmsCapsFormat = new ol.format.WMSCapabilities();
const wmsGetFeatureInfoFormats = {
  'application/json': new ol.format.GeoJSON(),
  'application/vnd.ogc.gml': new ol.format.WMSGetFeatureInfo()
};

class WMSService {
  getCapabilities(url, onSuccess, onFailure) {
    doGET(url, function(xmlhttp) {
      var info = wmsCapsFormat.read(xmlhttp.responseText);
      onSuccess.call(this, info.Capability.Layer);
    }, function(xmlhttp) {
      onFailure.call(this, xmlhttp);
    }, this);
  }
  getFeatureInfo(layer, coordinate, view, infoFormat, onSuccess) {
    var resolution = view.getResolution(), projection = view.getProjection();
    var url = layer.getSource().getGetFeatureInfoUrl(
      coordinate,
      resolution,
      projection, {
        'INFO_FORMAT': infoFormat
      }
    );
    doGET(url, function(response) {
      var result = {};
      if (infoFormat === 'text/plain' || infoFormat === 'text/html') {
        if (response.responseText.trim() !== 'no features were found') {
          result.text = response.responseText;
        } else {
          result = false;
        }
      } else {
        result.features = wmsGetFeatureInfoFormats[infoFormat].readFeatures(response.responseText);
      }
      onSuccess.call(this, result);
    });
  }
}

export default new WMSService();

import {doGET} from '../util.js';
import ol from 'openlayers';

const wmsCapsFormat = new ol.format.WMSCapabilities();

class WMSService {
  getCapabilities(url, onSuccess, onFailure) {
    doGET(url, function(xmlhttp) {
      var info = wmsCapsFormat.read(xmlhttp.responseText);
      onSuccess.call(this, info.Capability.Layer);
    }, function(xmlhttp) {
      onFailure.call(this, xmlhttp);
    }, this);
  }
}

export default new WMSService();

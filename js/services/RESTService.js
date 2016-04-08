import {doGET} from '../util.js';

class RESTService {
  getStyleName(url, layer, onSuccess, onFailure) {
    url = url.replace(/wms|ows|wfs/g, 'rest/layers/' + layer.get('id') + '.json');
    doGET(url, function(xmlhttp) {
      var styleInfo = JSON.parse(xmlhttp.responseText);
      onSuccess.call(this, styleInfo.layer.defaultStyle.name);
    }, function(xmlhttp) {
      onFailure.call(this, xmlhttp);
    }, this);
  }
}

export default new RESTService();

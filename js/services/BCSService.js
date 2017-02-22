/*
 * Copyright 2015-present Boundless Spatial Inc., http://boundlessgeo.com
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and limitations under the License.
 */

 var apikey = "";
 var layerArray =[];
 var map;
 var messages = {};
 var basemapUrl = "http://api.dev.boundlessgeo.io/v1/basemaps/";

 class BCSService {
   getPromise(serviceType) {
     return new Promise(function(resolve, reject) {
       var req = new XMLHttpRequest();
       if (serviceType === "basemaps"){
         url = basemapUrl;
       }
       else {
         console.log = ('No service defined');
         url = 'undefined';
       }
       req.open('GET', url);

       req.onload = function() {
         if (req.status == 200) {
           resolve(JSON.parse(req.response));
         } else {
           reject(Error(req.statusText));
         }
       };

       req.onerror = function() {
         reject(Error('Network Error'));
       };
       req.send();
     });
   };

   getBaseMaps(layerJSON){
     for (var i = 0, len = layerJSON.length; i < len; i++) {
       var bm = layerJSON[i];
       if (bm.tileFormat == 'PNG' && bm.standard == 'XYZ')	{
         var tile = new ol.layer.Tile({
           visible: eval(i == 2),
           title: bm.name,
           type: 'base',
           source: new ol.source.XYZ({url: bm.endpoint + '?apikey=' + apikey, attributions: [
             new ol.Attribution({
               html: bm.attribution
             })]
           })
         });
         layerArray.push(tile);
       }
     }
     map = new ol.Map({
       loadTilesWhileAnimating: true,
       controls: [new ol.control.Attribution({collapsible: true})],
       layers: [
         new ol.layer.Group({
           type: 'base-group',
           title: 'Base maps',
           layers: layerArray,
           view: new ol.View({
             center: [0, 0],
             zoom: 2,
             minZoom: 1,
             maxZoom: 10
           })
         })
       ],
       view: new ol.View({
         center: ol.proj.transform([0.0,0.0], 'EPSG:4326', 'EPSG:3857'),
         zoom: 2
       })
     });

     layerLoadComplete();

       }
 }

export default new BCSService();

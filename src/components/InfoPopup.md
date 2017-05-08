Popup to show feature info. This can be through WMS / WMTS GetFeatureInfo or local vector data.

```xml
<InfoPopup toggleGroup='navigation' map={map} />
```
![Info Popup](../InfoPopup.png)

##### How to render content on the popup:

Content to be rendered on the popup must be added to the appropriate OpenLayers Layer Object with a key `popupinfo`.

See [OpenLayers API](http://openlayers.org/en/latest/apidoc/ol.layer.Vector.html) for reference on ol.layer.Vector use.

```javascript
new ol.layer.Vector({
  title: 'airports',
  id: 'lyr03',
  popupInfo: '#AllAttributes',
  isSelectable: true,
  geometryType: 'Point',style: styleAirports,
  source: new ol.source.Vector({
    format: new ol.format.GeoJSON(),
    url: './data/airports.json'
  })
})
```

There are several options for content.

Boundless SDK
* _All Attributes_
* _Select Attributes_
* _Custom Content_


All Attributes (table)
----------------

  * To include a table with all of the attributes of the selected feature

    * `popupInfo: ‘#AllAttributes’`

        ![Info Popup](../InfoPopup.png)

    * See [Boundless SDK Plugin Application](http://boundlessgeo.github.io/sdk-apps/plugin) for more usage


Select Attributes (table)
----------------

  * To include a table with only attributes specified, declare an array containing the string names of the attributes to be included

    * `popupInfo: [‘cat’, ‘TYPE’]`

          ```javascript
          new ol.layer.Vector({
            title: 'airports',
            id: 'lyr03',
            popupInfo: [‘cat’, ‘TYPE’],
            isSelectable: true,
            geometryType: 'Point',style: styleAirports,
            source: new ol.source.Vector({
              format: new ol.format.GeoJSON(),
              url: './data/airports.json'
            })
          })
          ```

        ![Info Popup 2](../InfoPopup2.png)



Select Attributes (custom format)
----------------

  * To include feature attributes and their values without the provided table format, the string must include attribute keys wrapped in square brackets individually

    * `popupInfo: '<b>cat</b>: [cat]<br/><b>IKO</b>: [IKO]'`

          ```javascript
          new ol.layer.Vector({
            title: 'airports',
            id: 'lyr03',
            popupInfo: '<b>cat</b>: [cat]<br/><b>IKO</b>: [IKO]',
            isSelectable: true,
            geometryType: 'Point',style: styleAirports,
            source: new ol.source.Vector({
              format: new ol.format.GeoJSON(),
              url: './data/airports.json'
            })
          })
          ```

        ![Info Popup 3](../InfoPopup3.png)

    * See [Boundless SDK Basic Application](http://boundlessgeo.github.io/sdk-apps/basic) for more usage

    * It is not required to wrap the attribute value in HTML but HTML will be needed for any desired styling/formatting

Custom Content (custom format)
----------------

  * To include custom text in the popup without a table format, enter the string to include

    * `popupInfo: '<div style="color:blue;">Custom Content</div>'`

          ```javascript
          new ol.layer.Vector({
            title: 'airports',
            id: 'lyr03',
            popupInfo: '<div style="color:blue;">Custom Content</div>',
            isSelectable: true,
            geometryType: 'Point',style: styleAirports,
            source: new ol.source.Vector({
              format: new ol.format.GeoJSON(),
              url: './data/airports.json'
            })
          })
          ```

        ![Info Popup 4](../InfoPopup4.png)

  * It is not required to use HTML to render the text content but HTML will be needed for any desired styling/formatting

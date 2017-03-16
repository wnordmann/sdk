```xml
 <LayerList allowFiltering={true} showOpacity={true} showDownload={true} showGroupContent={true}
  showZoomTo={true} allowReordering={true} map={map} />
 ```

![Layer List](../LayerList.png)


##### SDK groups layers into three categories.  
* _Base Layer_
* _Vector Layer_
* _Raster Layers_


Base Layers
----------------

![BaseMap Layer List Item](../LayerListBaseMap.png)

Baselayers need to be added directly to the ol.Map
```javascript
var BaseLayers = [
    new ol.layer.Group({
      type: 'base-group',
      title: 'Base Maps',
      layers: [
        new ol.layer.Tile({
          type: 'base',
          title: 'OSM Streets',
          source: new ol.source.OSM()
        })
      ]
    })
  ];
```

or added using the [BaseMapSelector](BaseMapSelector.html) Component

### Base Layers UI Functions

#### `Visibility`

Turns Layer visibility on and off

Only one base layer can be visible at a time.  All base layers can be turned off by selecting the visibility eye on the BaseMap parent

Vector Layers
---------------
![vectorLayers](../LayerListItemVectorLayers.png)

Vector Layers can be added using the [AddLayer](,,/AddLayer.html) component


Or vector layers can be added directly to the ol.Map

```javascript
var vectorLayer = new ol.layer.Vector({
      opacity: 1.0,
      source: new ol.source.Vector({
        format: new ol.format.KML(),
        url: './data/KML_Samples.kml'
      }),

      style: style_kml_samplesplacemarksany,
      selectedStyle: selectionStyle_kml_samplesplacemarksany,
      title: 'States',
      id: 'States',
      filters: [],
      timeInfo: null,
      isSelectable: true,
      popupInfo: ''
    });
```


### Vector Layers UI Functions


#### `Opacity`
Changes the opacity of selected layer

Option can be disable with *showOpacity* Prop, default to true
```xml
<LayerList showOpacity={true} map={map} />
```

#### `Download Layer`

Download layer from Map

Function can be disable with *showDownload* Prop, default to false
```xml
<LayerList showDownload={true} map={map} />
```

####  `Filter Layer`

Opens the [FilterModal](FilterModal.html) to filter the data in the vector layer

Option can be disable with *allowFiltering* Prop, default to false
```xml
<LayerList allowFiltering={true} map={map} />
```


#### `Remove Layer`

Removes selected layer, only available when layer is added with the [AddLayer](,,/AddLayer.html) component

Option can be disable with *allowRemove* Prop, default to true
```xml
<LayerList allowRemove={false} map={map} />
```

#### `Visibility`

Turns Layer visibility on and off


#### `Zoom to Layers`
Zooms to the bounds of selected layer

Option can be disable with *showZoomTo* Prop, default to true
```xml
<LayerList showZoomTo={true} map={map} />
```

Rastor Layers
---------------
![rastorLayers](../LayerListRastor.png)

Raster Layers can be added using the addLayer Prop
```xml
<LayerList addLayer={{allowUserInput: true, sources: [{url: '/geoserver/wms', type: 'WMS', title: 'Local GeoServer'}]}}
 map={map} />
```

### `Opacity`
Changes the opacity of selected layer

Option can be disable with *showOpacity* Prop, default to true
```xml
<LayerList showOpacity={true} map={map} />
```

#### `Remove Layer`

Removes selected layer from map, does not affect geoserver / WMS server

#### `Visibility`

Turns Layer visibility on and off


### `Zoom to Layers`
Zooms to the bounds of selected layer

Option can be disable with *showZoomTo* Prop, default to true
```xml
<LayerList showZoomTo={true} map={map} />
```

### `Style Layers`
Styles Raster Layers using the [StyleModal](/../styleModal.html)

Option can be disable with *allowStyling* Prop, default to false
```xml
<LayerList allowStyling={true} map={map} />
```

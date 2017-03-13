LayerListItem is the single component used to build out the larger LayerList component.  Each layer is represented as a LayerListItem

![Layer List Item](../LayerListItem.png)

LayerListItem UI functions
-------------
SDK groups layers into one of three categories.  
* Base Layer
* Vector Layer
* Raster Layers


## Base Layers
Baselayers need to be added directly to the ol.Map or added using the [BaseMapSelector](BaseMapSelector.html) Component

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
        });```

#### `Visibility`

Turns Layer visibility on and off

Only one base layer can be on at once.  All base layers can be turned off by selecting the visibility eye on the BaseMap parent 




### `Download`

Download layer from Map, has no impact on services

Not available on base layers or Layers hosted from a server (WMS, WFS, ArcGISRest, WMTS)

Function can be disable with *showDownload* Prop

![Layer List Item UI Functions](../LayerListFilter.png)

###  `Filter`

Opens the [FilterModal](FilterModal.html)

Option can be disable with *allowFiltering*


![Layer List Item UI Functions](../LayerListItemWithNotes.png)


### `Opacity`

Changes the opacity of selected layer

Can not change opacity to a base layer

Option can be disable with *showOpacity* Prop


### `Remove`

Removed layer from Map, has no impact on services

Not available on base layers

Option can be disable with *allowRemove*



### `Style Editor`

Opens the [StyleModal](StyleModal.html)

Option can be disable with *allowStyling*


### `Visibility`

Turns Layer visibility on and off

Only one base layer can be on at once, all base layers can be turned off


### `Zoom to Layers`

Zooms to the bounds of selected layer

Can not zoom to a base layer

Option can be disable with *showZoomTo*

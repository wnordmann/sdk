`LayerList` (component)
=======================

A list of layers in the map. Allows setting visibility and opacity.

```html
<div id='layerlist'>
  <LayerList allowFiltering={true} showOpacity={true} showDownload={true} showGroupContent={true} showZoomTo={true} allowReordering={true} map={map} />
</div>
```

Properties
----------

### `addLayer`

Should we allow adding layers through WMS or WFS GetCapabilities?
Object with keys url (string, required), allowUserInput (boolean, optional) and asVector (boolean, optional).
If asVector is true, layers will be retrieved from WFS and added as vector.
If allowUserInput is true, the user will be able to provide a url through an input.

type: `shape [object Object]`


### `allowEditing`

Should we allow for editing of features in a vector layer?
This does require having a WFST component in your application.

type: `bool`
defaultValue: `false`


### `allowFiltering`

Should we allow for filtering of features in a layer?

type: `bool`
defaultValue: `false`


### `allowLabeling`

Should we allow for labeling of features in a layer?

type: `bool`
defaultValue: `false`


### `allowReordering`

Should we allow for reordering of layers?

type: `bool`
defaultValue: `false`


### `allowStyling`

Should we allow for styling of features in a vector layer?

type: `bool`
defaultValue: `false`


### `className`

Css class name to apply on the root element of this component.

type: `string`


### `downloadFormat`

The feature format to serialize in for downloads.

type: `enum ('GeoJSON'|'KML'|'GPX')`
defaultValue: `'GeoJSON'`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `map` (required)

The map whose layers should show up in this layer list.

type: `instanceOf ol.Map`


### `showDownload`

Should we show a download button for layers?

type: `bool`
defaultValue: `false`


### `showGroupContent`

Should we show the contents of layer groups?

type: `bool`
defaultValue: `true`


### `showOnStart`

Should we show this component on start of the application?

type: `bool`
defaultValue: `false`


### `showOpacity`

Should we show an opacity slider for layers?

type: `bool`
defaultValue: `false`


### `showZoomTo`

Should we show a button that allows the user to zoom to the layer's extent?

type: `bool`
defaultValue: `false`


### `style`

Style for the button.

type: `object`


### `tipLabel`

Text to show on top of layers.

type: `string`


### `tooltipPosition`

Position of the tooltip.

type: `enum ('bottom'|'bottom-right'|'bottom-left'|'right'|'left'|'top-right'|'top'|'top-left')`


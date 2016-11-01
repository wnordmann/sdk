`LayerListItem` (component)
===========================

An item in the LayerList component.

Properties
----------

### `allowEditing`

Should we allow editing of features in a vector layer?

type: `bool`


### `allowFiltering`

Should we allow for filtering of features in a layer?

type: `bool`


### `allowLabeling`

Should we allow for labeling of features in a layer?

type: `bool`


### `allowRemove`

Should we allow for removal of layers?

type: `bool`


### `allowReordering`

Should we show allow reordering?

type: `bool`


### `allowStyling`

Should we allow for styling of features in a vector layer?

type: `bool`


### `className`

Css class name to apply on the root element of this component.

type: `string`


### `connectDragSource` (required)

type: `func`
defaultValue: `function(a) {
  return a;
}`


### `connectDropTarget` (required)

type: `func`
defaultValue: `function(a) {
  return a;
}`


### `downloadFormat`

The feature format to serialize in for downloads.

type: `enum ('GeoJSON'|'KML'|'GPX')`


### `group`

The group layer to which this item might belong.

type: `instanceOf ol.layer.Group`


### `index` (required)

type: `number`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `layer` (required)

The layer associated with this item.

type: `instanceOf ol.layer.Base`


### `map` (required)

The map in which the layer of this item resides.

type: `instanceOf ol.Map`


### `moveLayer` (required)

type: `func`


### `nestedItems`

The nested items to show for this item.

type: `array`


### `onModalClose`

Called when a modal is closed by this layer list item.

type: `func`


### `onModalOpen`

Called when a modal is opened by this layer list item.

type: `func`


### `showDownload`

Should we show a download button?

type: `bool`


### `showOpacity`

Should we show an opacity slider for the layer?

type: `bool`


### `showZoomTo`

Should we show a zoom to button for the layer?

type: `bool`


### `title` (required)

The title to show for the layer.

type: `string`


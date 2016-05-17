`FeatureTable` (component)
==========================

A table to show features. Allows for selection of features.

```javascript
var selectedLayer = map.getLayers().item(2);
```

```xml
<div ref='tablePanel' id='table-panel' className='attributes-table'>
  <FeatureTable ref='table' resizeTo='table-panel' offset={[30, 30]} layer={selectedLayer} map={map} />
</div>
```

Properties
----------

### `buttonStyle`

Style for the buttons in the toolbar.

type: `object`
defaultValue: `{
  margin: '10px 12px'
}`


### `columnWidth`

The width in pixels per column.

type: `number`
defaultValue: `100`


### `headerHeight`

The height of the table header in pixels.

type: `number`
defaultValue: `50`


### `height`

The height of the table component in pixels.

type: `number`
defaultValue: `400`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `layer`

The layer to use initially for loading the table.

type: `instanceOf ol.layer.Vector`


### `map` (required)

The ol3 map in which the source for the table resides.

type: `instanceOf ol.Map`


### `minColumnWidth`

The minimum width in pixels per column.

type: `number`
defaultValue: `10`


### `offset`

Array with offsetX and offsetY, the number of pixels to make the table smaller than the resizeTo container.

type: `array`
defaultValue: `[0, 0]`


### `pointZoom`

The zoom level to zoom the map to in case of a point geometry.

type: `number`
defaultValue: `16`


### `refreshRate`

Refresh rate in ms that determines how often to resize the feature table when the window is resized.

type: `number`
defaultValue: `250`


### `resizeTo`

The id of the container to resize the feature table to.

type: `string`


### `rowHeight`

The height of a row in pixels.

type: `number`
defaultValue: `30`


### `width`

The width of the table component in pixels.

type: `number`
defaultValue: `400`


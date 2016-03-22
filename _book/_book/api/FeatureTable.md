`FeatureTable` (component)
==========================

A table to show features. Allows for selection of features.

Props
-----

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


### `layer` (required)

The layer to use initially for loading the table.

type: `instanceOfol.layer.Vector`


### `map` (required)

The ol3 map in which the source for the table resides.

type: `instanceOfol.Map`


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


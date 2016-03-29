`WMSLegend` (component)
=======================

Legend component for layers with a WMS source (tiled or untiled).

Properties
----------

### `format`

The format to use for the WMS GetLegendGraphic call.

type: `string`
defaultValue: `'image/png'`


### `height`

The height in pixels of the WMS GetLegendGraphic call.

type: `number`
defaultValue: `20`


### `layer` (required)

The layer that has a WMS source.

type: `instanceOf ol.layer.Layer`


### `width`

The width in pixels of the WMS GetLegendGraphic call.

type: `number`
defaultValue: `20`


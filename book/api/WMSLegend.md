`WMSLegend` (component)
=======================

Legend component for layers with a WMS source (tiled or untiled).

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`


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


### `options`

Options to send as LEGEND_OPTIONS parameter.

type: `object`
defaultValue: `{
  forceLabels: 'on',
  fontAntiAliasing: true,
  fontSize: 11,
  fontName: 'Arial'
}`


### `width`

The width in pixels of the WMS GetLegendGraphic call.

type: `number`
defaultValue: `20`


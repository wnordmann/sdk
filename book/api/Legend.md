`Legend` (component)
====================

Legend component that can show legend graphic for multiple layer and source types dynamically.

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `map` (required)

The map whose layers should show up in this legend component.

type: `instanceOf ol.Map`


### `wmsOptions`

Options to send to the WMS legend. See WMSLegend component.

type: `object`


`ZoomToLatLon` (component)
==========================

Component that allows zooming the map to a lat / lon position.

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `map` (required)

The map onto which to zoom.

type: `instanceOf ol.Map`


### `zoom`

The zoom level used when centering the view.

type: `number`
defaultValue: `14`


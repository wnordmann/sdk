`InfoPopup` (component)
=======================

Popup to show feature info. This can be through WMS GetFeatureInfo or local vector data.

Properties
----------

### `hover`

Should we show feature info on hover instead of on click?

type: `bool`
defaultValue: `false`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `map` (required)

The ol3 map to register for singleClick.

type: `instanceOf ol.Map`


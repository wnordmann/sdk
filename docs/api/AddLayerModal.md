`AddLayerModal` (component)
===========================

Modal window to add layers from a WMS or WFS service.

Properties
----------

### `allowUserInput`

Should be user be able to provide their own url?

type: `bool`
defaultValue: `false`


### `asVector`

Should we add layers as vector? Will use WFS GetCapabilities.

type: `bool`
defaultValue: `false`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `maxFeatures`

maxFeatures to use when retrieving features from a WMS layer.

type: `number`
defaultValue: `50`


### `srsName`

The srs name that the map's view is in.

type: `string`


### `url`

url that will be used to retrieve layers from (WMS or WFS).

type: `string`


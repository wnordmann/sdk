`AddLayerModal` (component)
===========================

Modal window to add layers from a WMS or WFS service.

Properties
----------

### `allowUserInput`

Should be user be able to provide their own url?

type: `bool`
defaultValue: `false`


### `className`

Css class name to apply on the dialog.

type: `string`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `map` (required)

The ol3 map to upload to.

type: `instanceOf ol.Map`


### `sources`

List of sources to use for this dialog.

type: `arrayOf shape`


### `srsName`

The srs name that the map's view is in.

type: `string`


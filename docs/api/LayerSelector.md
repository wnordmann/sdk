`LayerSelector` (component)
===========================

A combobox to select a layer.

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`


### `filter`

A filter function to filter out some of the layers by returning false.

type: `func`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `map` (required)

The map from which to extract the layers.

type: `instanceOf ol.Map`


### `onChange` (required)

Change callback function.

type: `func`


### `value`

The default value of the layer selector, i.e. the layer to select by default.

type: `string`


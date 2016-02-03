`LayerList.jsx` (component)
===========================

A list of layers in the map. Allows setting visibility and opacity.

Props
-----

### `allowFiltering`

Should we allow for filtering of features in a layer?

type: `bool`
defaultValue: `false`


### `allowLabeling`

Should we allow for labeling of features in a layer?

type: `bool`
defaultValue: `false`


### `allowReordering`

Should we allow for reordering of layers?

type: `bool`
defaultValue: `false`


### `expandOnHover`

Should we expand when hovering over the layers button?

type: `bool`
defaultValue: `true`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `map` (required)

The map whose layers should show up in this layer list.

type: `instanceOfol.Map`


### `showDownload`

Should we show a download button for layers?

type: `bool`
defaultValue: `false`


### `showGroupContent`

Should we show the contents of layer groups?

type: `bool`
defaultValue: `true`


### `showOpacity`

Should we show an opacity slider for layers?

type: `bool`
defaultValue: `false`


### `showZoomTo`

Should we show a button that allows the user to zoom to the layer's extent?

type: `bool`
defaultValue: `false`


### `tipLabel`

Text to show on top of layers.

type: `string`


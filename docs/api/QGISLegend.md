`QGISLegend` (component)
========================

A component that shows a legend based on artefacts created by the QGIS plugin Web Application Builder.

Props
-----

### `expandOnHover`

Should we expand when hovering over the legend button?

type: `bool`
defaultValue: `true`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `legendBasePath`

The base path (relative url) to use for finding the artefacts.

type: `string`
defaultValue: `'./legend/'`


### `legendData` (required)

The label and image to use per layer. The object is keyed by layer name currently. For example: {'swamp': [['', '4_0.png']]}.

type: `object`


### `map` (required)

The map from which to extract the layers.

type: `instanceOfol.Map`


### `showExpandedOnStartup`

Should we expand on startup of the application?

type: `bool`
defaultValue: `false`


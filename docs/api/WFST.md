`WFST` (component)
==================

Allows users to make changes to WFS-T layers. This can be drawing new
features and deleting or modifying existing features. Only geometry
changes are currently supported, no attribute changes.
This depends on ol.layer.Vector with ol.source.Vector. The layer
needs to have isWFST set to true. Also a wfsInfo object needs to be
configured on the layer with the following properties:
- featureNS: the namespace of the WFS typename
- featureType: the name (without prefix) of the underlying WFS typename
- geometryType: the type of geometry (e.g. MultiPolygon)
- geometryName: the name of the geometry attribute
- url: the online resource of the WFS endpoint

Props
-----

### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `map` (required)

The ol3 map whose layers can be used for the WFS-T tool.

type: `instanceOfol.Map`


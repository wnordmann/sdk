`MapTool` (component)
=====================

A tool that manages interactions on the map. The interactions will be
activated and deactivated depending on toggleGroup.

Props
-----

### `map` (required)

The map onto which to activate and deactivate the interactions.

type: `instanceOf ol.Map`


### `toggleGroup`

The toggleGroup to use. When this tool is activated, all other tools in the same toggleGroup will be deactivated.

type: `string`


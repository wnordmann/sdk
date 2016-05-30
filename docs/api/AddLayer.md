`AddLayer` (component)
======================

Adds a menu entry that can be used by the web app user to add a layer to the map.
Only vector layers can be added. Supported formats for layers are GeoJSON, GPX and KML.

```xml
<AddLayer map={map} />
```

Properties
----------

### `className`

Css class name to apply on the button.

type: `string`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `map` (required)

The ol3 map instance to add to.

type: `instanceOf ol.Map`


### `pointRadius`

The point radius used for the circle style.

type: `number`
defaultValue: `7`


### `strokeWidth`

The stroke width in pixels used in the style for the uploaded data.

type: `number`
defaultValue: `2`


### `style`

defaultValue: `{
  margin: '10px 12px'
}`


`ImageExport` (component)
=========================

Export the map as a PNG file. This will only work if the canvas is not tainted.

```xml
<ImageExport map={map} />
```

Properties
----------

### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `map` (required)

The ol3 map to export as PNG.

type: `instanceOf ol.Map`


### `style`

defaultValue: `{
  margin: '10px 12px'
}`


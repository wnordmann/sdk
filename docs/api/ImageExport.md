`ImageExport` (component)
=========================

Export the map as a PNG file. This will only work if the canvas is not tainted.

```xml
<ImageExport map={map} />
```

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `map` (required)

The ol3 map to export as PNG.

type: `instanceOf ol.Map`


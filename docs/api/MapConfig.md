`MapConfig` (component)
=======================

Export the map configuration and ability to reload it from local storage.

```xml
<MapConfig map={map} />
```

Properties
----------

### `buttonStyle`

Style for the buttons.

type: `object`
defaultValue: `{
  margin: '10px 12px'
}`


### `className`

Css class name to apply on the root element of this component.

type: `string`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `map` (required)

The ol3 map to save the layers from.

type: `instanceOf ol.Map`


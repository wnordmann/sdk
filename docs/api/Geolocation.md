`Geolocation` (component)
=========================

Enable geolocation which uses the current position of the user in the map.

```xml
<div id='geolocation-control' className='ol-unselectable ol-control'>
  <Geolocation map={map} />
</div>
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

The ol3 map for which to change its view's center.

type: `instanceOf ol.Map`


### `style`

Style for the button.

type: `object`
defaultValue: `{
  borderRadius: '2px',
  width: '28px',
  height: '28px',
  padding: '2px'
}`


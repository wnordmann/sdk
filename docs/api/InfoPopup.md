`InfoPopup` (component)
=======================

Popup to show feature info. This can be through WMS GetFeatureInfo or local vector data.

```html
<div id='popup' className='ol-popup'>
  <InfoPopup toggleGroup='navigation' map={map} />
</div>
```

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`


### `hover`

Should we show feature info on hover instead of on click?

type: `bool`
defaultValue: `false`


### `infoFormat`

Format to use for WMS GetFeatureInfo requests.

type: `string`
defaultValue: `'text/plain'`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `map` (required)

The ol3 map to register for singleClick.

type: `instanceOf ol.Map`


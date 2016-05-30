`Globe` (component)
===================

Adds a button to toggle 3D mode.
The HTML page of the application needs to include a script tag to cesium:

```html
<script src="./resources/ol3-cesium/Cesium.js" type="text/javascript" charset="utf-8"></script>
```

```html
<div ref='map' id='map'>
  <div id='globe-button' className='ol-unselectable ol-control'>
    <Globe map={map} />
  </div>
</div>
```

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`


### `hideScalebar`

Resolution at which to hide the scalebar in 3D mode

type: `number`
defaultValue: `78271`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `map` (required)

The ol3 map instance to work on.

type: `instanceOf ol.Map`


### `style`

Style for the button.

type: `object`
defaultValue: `{
  background: 'rgba(0,60,136,.7)',
  borderRadius: '2px',
  width: '28px',
  height: '28px',
  padding: '2px'
}`


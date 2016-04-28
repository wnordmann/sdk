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

### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `map` (required)

The ol3 map instance to work on.

type: `instanceOf ol.Map`


`HomeButton` (component)
========================

A button to go back to the initial extent of the map.

```html
<div id='home-button' className='ol-unselectable ol-control'>
  <HomeButton map={map} />
</div>
```

Properties
----------

### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `map` (required)

The ol3 map for whose view the initial center and zoom should be restored.

type: `instanceOf ol.Map`


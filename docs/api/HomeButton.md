`HomeButton` (component)
========================

A button to go back to the initial extent of the map.

```html
<div id='home-button'>
  <HomeButton map={map} />
</div>
```

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`


### `extent`

Extent to fit on the map on pressing this button. If not set, the initial extent of the map will be used.

type: `arrayOf number`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `map` (required)

The ol3 map for whose view the initial center and zoom should be restored.

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


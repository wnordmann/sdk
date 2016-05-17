`Zoom` (component)
==================

Two buttons to zoom in and out.

```html
<div id='zoom-buttons'>
  <Zoom map={map} />
</div>
```

Properties
----------

### `delta`

The zoom delta applied on each click.

type: `number`
defaultValue: `1`


### `duration`

Animation duration in milliseconds.

type: `number`
defaultValue: `250`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `map` (required)

The ol3 map to use for zooming.

type: `instanceOf ol.Map`


### `style`

Style for the buttons.

type: `object`
defaultValue: `{
  background: 'rgba(0,60,136,.7)',
  borderRadius: '2px',
  width: '28px',
  height: '28px',
  padding: '2px'
}`


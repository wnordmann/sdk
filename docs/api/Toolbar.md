`Toolbar` (component)
=====================

Adds the ability to show a toolbar with buttons. On small screen sizes
a dropdown will be shown instead.

Props
-----

### `media`

Handled automatically by the responsive decorator.

type: `func`


### `options` (required)

The options to show in the toolbar. An array of objects with jsx, icon, title and onClick keys.
When using the jsx option, make sure to use a key property in the root element.

type: `arrayOf[object Object]`


### `width`

Width in pixels below which mobile layout should kick in.

type: `number`
defaultValue: `1024`


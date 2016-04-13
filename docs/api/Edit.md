`Edit` (component)
==================

A component that allows creating new features, so drawing their geometries and setting feature attributes through a form.

```xml
<div ref='editToolPanel' className='edit-tool-panel'><Edit toggleGroup='navigation' map={map} /></div>
```

Properties
----------

### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `map` (required)

The map onto which to activate and deactivate the interactions.

type: `instanceOf ol.Map`


### `pointRadius`

The point radius used for the circle style.

type: `number`
defaultValue: `7`


### `strokeWidth`

The stroke width in pixels used in the style for the created features.

type: `number`
defaultValue: `2`


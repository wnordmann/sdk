`Toolbar` (component)
=====================

Adds the ability to show a toolbar with buttons. On small screen sizes
a dropdown will be shown instead.

```javascript
var options = [{
  jsx: (<Login />)
}, {
  jsx: (<ImageExport map={map} />)
}, {
  jsx: (<Measure toggleGroup='navigation' map={map}/>)
}, {
  jsx: (<AddLayer map={map} />)
}, {
  jsx: (<QGISPrint map={map} layouts={printLayouts} />)
}, {
  jsx: (<Select toggleGroup='navigation' map={map}/>)
}, {
  text: formatMessage(messages.navigationbutton),
  title: formatMessage(messages.navigationbuttontitle),
  onClick: this._navigationFunc.bind(this),
  icon: 'hand-paper-o'
}];
```

```xml
<Toolbar options={options} />
```

Properties
----------

### `media`

Handled automatically by the responsive decorator.

type: `func`


### `options` (required)

The options to show in the toolbar. An array of objects with jsx (element), icon (string), text (string),
title (string), pullRight (boolean) and onClick (function) keys.
When using jsx, use exclude to not have the item show up in the menu on small screens,
but separate in the toolbar.

type: `arrayOf shape`


### `width`

Width in pixels below which mobile layout should kick in.

type: `number`
defaultValue: `1024`


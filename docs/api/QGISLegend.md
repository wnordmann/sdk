`QGISLegend` (component)
========================

A component that shows a legend based on artefacts created by the QGIS plugin Web Application Builder.

```javascript
var legendData = {
  'geo20130827100512660': [
    {
     'href': '0_1.png',
      'title': 'Hill_111'
    }, {
      'href': '0_2.png',
      'title': 'Hill_112'
    }
  ],
  'pt120130827095302041': [
    {
      'href': '2_0.png',
      'title': '85.0-116.84'
    }, {
      'href': '2_1.png',
      'title': '116.84-148.68'
    }
  ]
};
```

```html
<div id='legend'>
  <QGISLegend map={map} legendBasePath='./resources/legend/' legendData={legendData} pullRight/>
</div>
```

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`


### `expandOnHover`

Should we expand when hovering over the legend button?

type: `bool`
defaultValue: `true`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `legendBasePath`

The base path (relative url) to use for finding the artefacts.

type: `string`
defaultValue: `'./legend/'`


### `legendData` (required)

The label and image to use per layer. The object is keyed by layer name currently. For example: {'swamp': [['', '4_0.png']]}.

type: `object`


### `map` (required)

The map from which to extract the layers.

type: `instanceOf ol.Map`


### `showExpandedOnStartup`

Should we expand on startup of the application?

type: `bool`
defaultValue: `false`


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


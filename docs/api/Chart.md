`Chart` (component)
===================

Allow for the creation of charts based on selected features of a layer.

```javascript
var charts = [{
  title: 'Airports count per use category',
  categoryField: 'USE',
  layer: 'lyr03',
  valueFields: [],
  displayMode: 2,
  operation: 2
}, {
  title: 'Forest area total surface',
  categoryField: 'VEGDESC',
  layer: 'lyr01',
  valueFields: ['AREA_KM2'],
  displayMode: 1,
  operation: 2
}];
```

```xml
<div  id='chart-panel'><Chart ref='chartPanel' combo={true} charts={charts}/></div>
```

Properties
----------

### `charts` (required)

An array of configuration objects. Configuration objects have title, categoryField, layer,
valueFields, displayMode and operation keys.
title (string, required) is the title to display for the chart.
categoryField (string, optional) is the attribute to use as the category.
layer (string, required) is the id property of the corresponding layer to use.
valueFields (array of string, required) is an array of field names to use for displaying values in the chart.
displayMode (enum(0, 1, 2), required) defines how the feature attributes will be used to create the chart. When using a value of 0 (by feature), an element will
be added to the chart for each selected feature. When using a value of 1 (by category), selected features will be grouped according to
a category defined by the categoryField. When using a value of 2 (count by category) the chart will show the number of features in each
category.
The statistic function to use when displayMode is by category (1) is defined in the operation (enum(0, 1, 2, 3), optional) key.
A value of 0 means MIN, a value of 1 means MAX, a value of 2 means SUM and a value of 3 means AVG (Average).

type: `arrayOf shape`


### `className`

Css class name to apply on the menu or div.

type: `string`


### `combo`

If true, show a combo box to select charts instead of dropdown button.

type: `bool`
defaultValue: `false`


### `container`

The id of the container to show when a chart is selected.

type: `string`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


`LayerSelector` (component)
===========================

A combobox to select a layer.

```xml
<LayerSelector map={map} onChange={this._onChange.bind(this)} />
```

![Layer Selector](../LayerSelector.png)
![Opened Layer Selector](../LayerSelectorOpen.png)

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`


### `filter`

A filter function to filter out some of the layers by returning false.

type: `func`



### `map` (required)

The map from which to extract the layers.

type: `instanceOf ol.Map`


### `onChange` (required)

Change callback function.

type: `func`


### `value`

The default value of the layer selector, i.e. the layer to select by default.

type: `string`


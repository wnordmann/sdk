`EditForm` (component)
======================

Form to allow editing of the attributes of a feature.

```xml
<EditForm map={this.props.map} onGeometryUpdate={this._onGeomUpdate.bind(this)} onSuccess={this._onSuccess.bind(this)} onDeleteSuccess={this._onDeleteSuccess.bind(this)} feature={this.state.feature} layer={this.state.layer} />
```

![Edit Form](../EditForm.png)

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`


### `feature` (required)

The feature whose values to display and edit.

type: `instanceOf ol.Feature`



### `layer` (required)

The layer from which the feature comes.

type: `instanceOf ol.layer.Base`


### `map` (required)

The ol3 map.

type: `instanceOf ol.Map`


### `onDeleteSuccess`

Callback function for successfull delete

type: `func`


### `onGeometryUpdate`

Callback function for successfull geometry update

type: `func`


### `onSuccess`

Callback function for successfull update

type: `func`


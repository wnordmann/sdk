`QueryBuilder` (component)
==========================

A component that allows users to perform queries on vector layers. Queries can be new queries, added to existing queries or users can filter inside of an existing query a.k.a. drill-down.

```xml
<QueryBuilder map={map} />
```

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`



### `map` (required)

The ol3 map whose layers can be used for the querybuilder.

type: `instanceOf ol.Map`


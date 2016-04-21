`QueryBuilder` (component)
==========================

A component that allows users to perform queries on vector layers. Queries can be new queries, added to existing queries or users can filter inside of an existing query a.k.a. drill-down.

```xml
<QueryBuilder map={map} />
```

Properties
----------

### `buttonStyle`

Style for the buttons in the toolbar.

type: `object`
defaultValue: `{
  margin: '10px 12px'
}`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `map` (required)

The ol3 map whose layers can be used for the querybuilder.

type: `instanceOf ol.Map`


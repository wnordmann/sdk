`QueryBuilder.jsx` (component)
==============================

A component that allows users to perform queries on vector layers. Queries can be new queries, added to existing queries or users can filter inside of an existing query a.k.a. drill-down.

Props
-----

### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `map` (required)

The ol3 map whose layers can be used for the querybuilder.

type: `instanceOfol.Map`


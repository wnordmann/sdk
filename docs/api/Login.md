`Login` (component)
===================

Button that shows a login dialog for integration with GeoServer security.

```xml
<Login />
```

Properties
----------

### `className`

Css class name to apply on the root element of this component.

type: `string`


### `intl`

i18n message strings. Provided through the application through context.

type: `custom`


### `style`

Style config object.

type: `object`
defaultValue: `{
  margin: '10px 12px'
}`


### `url`

Url to geoserver login endpoint.

type: `string`
defaultValue: `'/geoserver/app/api/login'`


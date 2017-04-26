`LeftNav` (component)
=====================

Drawer to use for left nav, drawer uses dropdown list to control tabs

```xml
const tablist = [   <Tab key={1} value={1} label='Legend'><Legend map={map} /></Tab>,
                     <Tab key={2} value={2} label='FeatureTabe'><FeatureTable ref='table' map={map} /></Tab>,
                     <Tab key={3} value={3} label='WFST'><WFST ref='edit' toggleGroup='navigation' showEditForm={true} map={map} />]</Tab>
                 ];
<LeftNav tabList={tablist}  />
```

Properties
----------

### `children`

Contents of the Drawer

type: `node`


### `menuOpen`

defaultValue: `false`


### `onRequestClose` (required)

Callback for closing the drawer

type: `func`


### `open`

If true drawer is opened

type: `bool`
defaultValue: `true`


### `style`

Style config.

type: `object`


### `tabList`

array of <tab> components to be added to <Tabs>

type: `node`


### `width`

Override width of left nav

type: `number`
defaultValue: `360`


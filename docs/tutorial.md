# Tutorial

## 1. Using the generator
In the getting started section we have learned how to create a skeleton application with ```sdk-generator```.

This application contains two base map layer, ```MapQuest``` streets and aerial, and a single widget, the ```LayerList``` widget.

The main file of the application is ```app.jsx```. Open up this file in your favorite text editor. Look for the definition of the ```ol.Map```. The map gets defined with a layer group, that combines the MapQuest streets and aerial layers. The view is defined with an initial  center and zoom level. If you are not familiar with OpenLayers 3, the recommendation is to use the workshop at http://openlayers.org/workshop/ to get up to speed with OpenLayers 3.

## 2. Adding a vector layer from a GeoJSON file
Download USA states data as GeoJSON from: http://data.okfn.org/data/datasets/geo-boundaries-us-110m

Add the following layer definition:

```
  new ol.layer.Vector({
    id: 'states',
    title: 'USA States',
    source: new ol.source.Vector({
      url: 'ne_110m_admin_1_states_provinces_shp_scale_rank.geojson',
      format: new ol.format.GeoJSON()
    })
  })
```

And change the view's center so that the GeoJSON layer will be visible on start up:

```
  view: new ol.View({
    center: [-10605790.55, 4363637.07],
    zoom: 4
  })
```

## 3. Adding a feature grid
In this step we'll learn how to add another component to the application. First, we'll add an import statement at the top of ```app.jsx```:

```
import FeatureTable from './node_modules/boundless-sdk/js/components/FeatureTable.jsx';
```

In the render function of our application, we need to add the definition of our new component, ```FeatureTable```:

The feature table needs to get configured with at least a layer and a map:

```
  <div ref='map' id='map'></div>
  <div><LayerList map={map} /></div>
  <div id='table'><FeatureTable map={map} layer={map.getLayers().item(1)} /></div>
```

Our div with id ```table``` does not yet have a size, so open up ```app.css``` and give it some space on the page:

```
#map {
  width: 100%;
  height: 60%;
}
#table {
  width: 100%;
  height: 40%;
}
```

We have reduced the map div to 60% and allocated 40% for the table.

If you reload the debug server ```index.html``` page at http://localhost:3000/ you'll see that we now have a feature table at the bottom of the page. The width of the feature table however is not optimal. Let's define that we want our feature table to resize to the table div, for this we use the ```resizeTo``` property to point to the id of the table div:

```
<FeatureTable resizeTo='table' map={map} layer={map.getLayers().item(1)} />
```

When you click a row in the feature table, it will select the corresponding geometry in the map.

## 4. Adding an upload component
In this step we'll be adding a button to the application that will open up a dialog where the user can upload a vector file, such as a KML, GPX or GeoJSON file.

Again, we will start by adding an ```import``` statement to import our component:

```
import AddLayer from './node_modules/boundless-sdk/js/components/AddLayer.jsx';
```

In the ```render``` function of our application, we need to add a toolbar to accommodate for the button of the upload component:

```
  <nav role='navigation'>
    <div className='toolbar'>
      <ul><AddLayer map={map} /></ul>
    </div>
  </nav>
```

Add the ```nav``` just after the ```<article>``` opening tag.

Also add a div to group the map and featuretable divs, with id ```content```:

```
  <div id='content'>
    <div ref='map' id='map'></div>
    <div><LayerList map={map} /></div>
    <div id='table'><FeatureTable resizeTo='table' map={map} layer={map.getLayers().item(1)} /></div>
  </div>
```

Open up app.css to give a bit of space to the button in the toolbar with ```padding-top```, also give the toolbar a fixed height and adjust the ```content``` div's height accordingly:

```
.toolbar {
  height: 50px;
}
#content {
  width: 100%;
  height:  calc(100% - 50px);
}
.toolbar ul {
  padding-top: 4px;
}
```

# Web Application Builder

WAB stands for Web Application Builder and is a QGIS plugin. The QGIS plugin has a ```CreateApp``` button which will generate the files needed for the SDK to work with. In this section we will explain how this process works.

## Using application created by WAB
When you are done creating an application with WAB, and have used the Preview function to make sure it satisfies your expectations, then press the ```CreateApp``` button and specify an output directory. The following set of files and subdirectories will get created in a subdirectory called ```webapp```:

```
app.css		app.jsx		data		index.html	resources
```

Change directory to the ```webapp``` subdirectory:

```
cd webapp
```

Run the ```web-sdk``` command in the directory that was created by WAB and answer the question with y:

```
destination is not empty, continue? [y/N]
```

Now run the npm install command:

```
npm install
```

After this run:

```
npm start
```

to start up the debug server. Access it with http://localhost:3000 in a browser and verify that it works.

To create a production version of the application run the following command:

```
npm run package
```

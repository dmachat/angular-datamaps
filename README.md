# Angular Datamaps

### Note: This directive's scope values have changed as of v0.1.0 to better match the object structure used by DataMaps.

Provides an Angular directive to wrap https://github.com/markmarkoh/datamaps and easily build data maps in your Angular application.

 - Automatically updates on changes to bound data and options
 - onClick events integrate with your parent controllers
 - Evaluates plugins passed to the directive
 - Easily toggle zoom functionality
 - Documentation for available options can be found at https://github.com/markmarkoh/datamaps

![Datamap example](/usaMap.png?raw=true "USA Map Example")

## Install
Install with bower and save to your project's bower.json
```sh
bower install angular-datamaps --save
```

Add the module to your app dependencies and include it in your page.
```js
angular.module('app', [
  'datamaps'
]);
```

Load DataMaps and the two libraries DataMaps depends on (d3 and topojson).
```html
<script src="d3.js"></script>
<script src="topojson.js"></script>
<script src="datamaps.all.js"></script>
<script src="angular-datamaps.js"></script>

<datamap
  map="mapObject"
  >
</datamap>
```

Add a map configuration object to your scope to bind to the directive
```js
$scope.mapObject = {
  scope: 'usa',
  options: {
    width: 1110,
    legendHeight: 60 // optionally set the padding for the legend
  },
  geographyConfig: {
    highlighBorderColor: '#EAA9A8',
    highlighBorderWidth: 2
  },
  fills: {
    'HIGH': '#CC4731',
    'MEDIUM': '#306596',
    'LOW': '#667FAF',
    'defaultFill': '#DDDDDD'
  },
  data: {
    "AZ": {
      "fillKey": "MEDIUM",
    },
    "CO": {
      "fillKey": "HIGH",
    },
    "DE": {
      "fillKey": "LOW",
    },
    "GA": {
      "fillKey": "MEDIUM",
    }
  },
}
```

### Geography click events ###
The DataMaps click event can trigger a bound function with the clicked geography object. just add your custom function to the `on-click` attribute, like this (notice there are no parenthesis):

```html
<datamap
  map="mapObject"
  on-click="updateActiveGeography"
  >
</datamap>
```

Then in your controller, that function gets the selected geography object as it's argument, like so:

```js
$scope.updateActiveGeography = function(geography) {
  $scope.stateName = geography.properties.name;
  $scope.stateCode = geography.id;
}
```

### Toggle zoom ###
Set the `zoomable` attribute to toggle a simple zoom on the map.

### Responsive ###
Bind the built-in Datamaps responsive methods by setting `$scope.mapObject.responsive = true`.

### Animated Update Choropleth ###
Set `options.staticGeoData = true` to allow the map to update with only `updateChoropleth`. Update choropleth only works if _updating_ is all we're doing. If geographies are added or removed from data, we have to redraw the map, so use this to explicitly say whether or not the directive can update choropleth mappings only.

### Adding plugins ###
You may add plugins that will be evaluated by the DataMaps plugin system in order to extend the labels or legend, for example. Use it by providing an object with plugin functions keyed by name.

Data may be supplied to plugins through the `plugin-data`. This should be an object with keys corresponding to plugin names.

If you would like to pass data into a core Datamaps plugin, be sure to include an empty entry for the plugin in the `plugin` object. This will ensure that gets processed. Datamaps won't override a plugin that is already defined.

```html
<datamap
  map="mapObject"
  plugins="mapPlugins"
  plugin-data="mapPluginData"
  >
</datamap>
```

```js
$scope.mapObject = mapObject;
$scope.mapPlugins = {
  bubbles: null,
  customLegend: function(layer, data, options) {
    var html = ['<ul class="list-inline">'],
        label = '';
    for (var fillKey in this.options.fills) {
      html.push('<li class="key" ',
                  'style="border-top: 10px solid ' + this.options.fills[fillKey] + '">',
                  fillKey,
                  '</li>');
    }
    html.push('</ul>');
    d3.select(this.options.element).append('div')
      .attr('class', 'datamaps-legend')
      .html(html.join(''));
  }
};
$scope.mapPluginData = {
  bubbles: [{name: 'Bubble 1', latitude: 21.32, longitude: -7.32, radius: 45, fillKey: 'gt500'}]
};

```

## Build it yourself!
angular-datamaps is built with grunt.

To run a simple connect server to see the directive in action or to develop
```sh
grunt dev
```

To run the tests
```sh
grunt test
```

or run in autotest mode

```sh
grunt autotest
```

And when you're done minify it
```sh
grunt build
```

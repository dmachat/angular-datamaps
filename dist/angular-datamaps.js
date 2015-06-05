'use strict';
angular.module('datamaps', []);
'use strict';
angular.module('datamaps').directive('datamap', [
  '$window',
  function ($window) {
    return {
      restrict: 'EA',
      scope: {
        map: '=',
        plugins: '=?',
        zoomable: '@?',
        onClick: '&?',
        pluginData: '='
      },
      link: function (scope, element, attrs) {
        // Generate base map options
        function mapOptions() {
          return {
            element: element[0],
            scope: 'usa',
            height: scope.height,
            width: scope.width,
            fills: { defaultFill: '#b9b9b9' },
            data: {},
            done: function (datamap) {
              function redraw() {
                datamap.svg.selectAll('g').attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
              }
              if (angular.isDefined(attrs.onClick)) {
                datamap.svg.selectAll('.datamaps-subunit').on('click', function (geography) {
                  scope.onClick()(geography);
                });
              }
              if (angular.isDefined(attrs.zoomable)) {
                datamap.svg.call(d3.behavior.zoom().on('zoom', redraw));
              }
            }
          };
        }
        scope.api = {
          refresh: function (map) {
            scope.api.updateWithOptions(map);
          },
          updateWithOptions: function (map) {
            // Clearing
            scope.api.clearElement();
            // Update bounding box
            scope.width = (map.options || {}).width || null;
            scope.height = (map.options || {}).height || (scope.width ? scope.width * 0.5 : null);
            scope.legendHeight = (map.options || {}).legendHeight || 50;
            // Set a few defaults for the directive
            scope.mapOptions = mapOptions();
            // Add the good stuff
            scope.mapOptions = angular.extend(scope.mapOptions, map);
            scope.datamap = new Datamap(scope.mapOptions);
            // Add responsive listeners
            if (scope.mapOptions.responsive) {
              $window.addEventListener('resize', scope.api.resize);
            } else {
              $window.removeEventListener('resize', scope.api.resize);
            }
            // Update plugins
            scope.api.updatePlugins(scope.datamap);
            // Update options and choropleth
            scope.api.refreshOptions(map.options);
            scope.api.updateWithData(map.data);
          },
          updatePlugins: function (datamap) {
            if (!scope.plugins) {
              return;
            }
            var pluginData = scope.pluginData || {};
            angular.forEach(scope.plugins, function (plugin, name) {
              datamap.addPlugin(name, plugin);
              datamap[name](pluginData[name]);
            });
          },
          refreshOptions: function (options) {
            if (!options) {
              return;
            }
            // set labels
            if (options.labels) {
              scope.datamap.labels({
                labelColor: options.labelColor ? options.labelColor : '#333333',
                fontSize: options.labelSize ? options.labelSize : 12
              });
            }
            // set legend
            if (options.legend) {
              scope.datamap.legend();
            }
          },
          resize: function () {
            scope.datamap.resize();
          },
          updateWithData: function (data) {
            scope.datamap.updateChoropleth(data);
            scope.api.updatePlugins(scope.datamap);
          },
          clearElement: function () {
            scope.datamap = null;
            element.empty().css({
              'position': 'relative',
              'display': 'block',
              'padding-bottom': scope.legendHeight + 'px'
            });
          }
        };
        // Watch data changing
        scope.$watch('map', function (map, old) {
          // Return if no data
          if (!map || angular.equals({}, map)) {
            return;
          }
          // Allow animated transition when geos don't change
          // or fully refresh
          if (!scope.datamap || angular.equals(map.data, old.data)) {
            scope.api.refresh(map);
          } else if ((map.options || {}).staticGeoData) {
            scope.api.updateWithData(map.data);
          } else {
            scope.api.refresh(map);
          }
        }, true);
        //update the plugins if the pluginData has changed
        scope.$watch('pluginData', function () {
          scope.api.updatePlugins(scope.datamap);
        }, true);
      }
    };
  }
]);
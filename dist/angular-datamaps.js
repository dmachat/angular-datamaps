'use strict';
angular.module('datamaps', []);
'use strict';
angular.module('datamaps').directive('datamap', [
  '$compile',
  function ($compile) {
    return {
      restrict: 'EA',
      scope: {
        map: '=',
        plugins: '=?',
        zoomable: '@?',
        onClick: '&?'
      },
      link: function (scope, element, attrs) {
        // Generate base map options
        function mapOptions() {
          return {
            element: element[0].children[0],
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
            angular.forEach(scope.plugins, function (plugin, name) {
              datamap.addPlugin(name, plugin);
              datamap[name]();
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
          updateWithData: function (data) {
            scope.datamap.updateChoropleth(data);
            scope.api.updatePlugins(scope.datamap);
          },
          clearElement: function () {
            scope.datamap = null;
            element.empty();
            var mapContainer = $compile('<div style="position: relative; display: block; padding-bottom: {{ legendHeight }}px;"></div>')(scope);
            element.append(mapContainer);
          }
        };
        // Watch data changing
        scope.$watch('map', function (map, old) {
          // Return if no data
          if (angular.isUndefined(map) || angular.equals({}, map)) {
            return;
          }
          // Init the datamap, or update data
          if (!scope.datamap || angular.equals(old.data, map.data)) {
            scope.api.refresh(map);
          } else {
            scope.api.updateWithData(map.data);
          }
        }, true);
      }
    };
  }
]);
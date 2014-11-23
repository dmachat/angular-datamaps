'use strict';

angular.module('datamaps')

  .directive('datamap', ['$compile', function($compile) {
    return {
      restrict: 'EA',
      scope: {
        map: '=',       //datamaps objects [required]
        onClick: '&?',  //geography onClick event [optional]
      },
      link: function(scope, element, attrs) {

        // Generate base map options
        function mapOptions(options) {
          return {
            element: element[0].children[0],
            scope: 'usa',
            height: scope.height,
            width: scope.width,
            fills: {
              defaultFill: '#b9b9b9'
            },
            data: {},
            done: function(datamap) {
              if (angular.isDefined(attrs.onClick)) {
                datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
                  scope.onClick()(geography);
                });
              }
            }
          };
        }

        scope.api = {

          // Fully refresh directive
          refresh: function(map) {
            scope.api.updateWithOptions(map);
          },

          // Update chart with new options
          updateWithOptions: function(map) {

            // Clearing
            scope.api.clearElement();

            // Update bounding box
            scope.width = map.options.width || 600;
            scope.height = map.options.height || scope.width * 0.6;
            scope.legendHeight = map.options.legendHeight || 50;

            // Set a few defaults for the directive
            scope.mapOptions = mapOptions(map.options);

            // Add the good stuff
            scope.mapOptions = angular.extend(scope.mapOptions, map);

            scope.datamap = new Datamap(scope.mapOptions);

            // Update options and choropleth
            scope.api.refreshOptions(map.options);
            scope.api.updateWithData(map.data);
          },

          // Set options on the datamap
          refreshOptions: function(options) {
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

          // Update chart with new data
          updateWithData: function(data) {
            scope.datamap.updateChoropleth(data);
          },

          // Fully clear directive element
          clearElement: function () {
            scope.datamap = null;
            element.empty();
            var mapContainer = $compile('<div style="position: relative; display: block; padding-bottom: {{ legendHeight }}px;"></div>')(scope);
            element.append(mapContainer);
          }
        };

        // Watch data changing
        scope.$watch('map', function(map, old) {
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
  }]);

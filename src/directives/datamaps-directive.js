'use strict';

angular

  .module('datamaps')

  .directive('datamap', ['$window', function($window) {
    return {
      restrict: 'EA',
      scope: {
        map: '=',       //datamaps objects [required]
        plugins: '=?',  //datamaps plugins [optional]
        zoomable: '@?', //zoomable toggle [optional]
        onClick: '&?',  //geography onClick event [optional],
        pluginData: '=' //datamaps plugin data object where keys are plugin names [optional]
        api: '=?'       //hook into datamaps API methods [optional]
      },
      link: function(scope, element, attrs) {

        var zoom;

        // Generate base map options
        function mapOptions() {
          return {
            element: element[0],
            scope: 'usa',
            height: scope.height,
            width: scope.width,
            aspectRatio: scope.aspectRatio,
            fills: {
              defaultFill: '#b9b9b9'
            },
            data: {},
            done: function(datamap) {
              zoom = d3.behavior.zoom()
                  .scaleExtent([1, 10])
                  .on('zoom', redraw);

              function redraw() {
                datamap.svg.selectAll('g')
                  .attr('transform', 'translate(' + d3.event.translate + ')scale(' + d3.event.scale + ')');
              }
              if (angular.isDefined(attrs.onClick)) {
                datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {
                  scope.onClick()(geography);
                });
              }
              if (angular.isDefined(attrs.zoomable)) {
                datamap.svg.call(zoom);
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
            scope.width = (map.options || {}).width || null;
            scope.height = (map.options || {}).height || (scope.width ? scope.width * 0.5 : null);
            scope.aspectRatio = (map.options || {}).aspectRatio || null;
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

          // Add and initialize optional plugins
          updatePlugins: function(datamap) {
            if (!scope.plugins) {
              return;
            }

            var pluginData = scope.pluginData || {};

            angular.forEach(scope.plugins, function(plugin, name) {
              datamap.addPlugin(name, plugin);
              datamap[name](pluginData[name]);
            });
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

          // Trigger datamaps resize method
          resize: function() {
            scope.datamap.resize();
          },

          // Update chart with new data
          updateWithData: function(data) {
            scope.datamap.updateChoropleth(data);
            scope.api.updatePlugins(scope.datamap);
          },

          // Fully clear directive element
          clearElement: function () {
            scope.datamap = null;
            element
              .empty()
              .css({
                'position': 'relative',
                'display': 'block',
                'padding-bottom': scope.legendHeight + 'px'
              });
          }

          zoomClick: function(zoomType, factor) {
            var zoomType = zoomType || 'reset';
            var factor = factor || 1.2;
            var center = [element[0].offsetWidth / 2, element[0].offsetHeight / 2];
            var scale = zoom.scale();
            var translate = zoom.translate();
            var extent = zoom.scaleExtent();

            if (zoomType === 'reset') {
              zoom.scale(1).translate([0,0]);
              scope.datamap.svg.selectAll('g').attr('transform', 'translate(' + [0, 0] + ')scale(' + 1 + ')');
              return false;
            } else if (zoomType === 'out') {
              factor = 1 / factor;
            }

            var target_scale = scale * factor;

            // If we're already at an extent, done
            if (target_scale < extent[0] || target_scale === extent[1]) {
              return false;
            }

            // If the factor is too much, scale it down to reach the extent exactly
            var clamped_target_scale = Math.max(extent[0], Math.min(extent[1], target_scale));

            if (clamped_target_scale != target_scale){
              target_scale = clamped_target_scale;
              factor = target_scale / scale;
            }

            // Center each vector, stretch, then put back
            var x = (translate[0] - center[0]) * factor + center[0];
            var y = (translate[1] - center[1]) * factor + center[1];

            // Update zoom value itself
            zoom.scale(target_scale).translate([x,y]);

            // Update map
            scope.datamap.svg.selectAll('g').attr('transform', 'translate(' + [x, y] + ')scale(' + target_scale + ')');
          }
        };

        // Watch data changing
        scope.$watch('map', function(map, old) {
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
        scope.$watch('pluginData', function(){
          scope.api.updatePlugins(scope.datamap);
        }, true);
      }
    };
  }]);

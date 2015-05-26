## 0.1.0
###### _May 25, 2015_

##### Breaking Changes
- Refactored scope API variables
  - `scope.map` is now the only required input, and maps directly to the object required by Datamaps

##### General
- Updated Datamaps dependency to v0.4.0
- Remove unneccessary non-semantic markup hindering Datamap rendering
- API for loading plugins for Datamaps has been added
  - Example plugin with a custom legend included in Readme
- Responsive binding has been added
- Zoomable option has been added
- Allow updateChoropleth when geographies don't change
- Slightly cleaner watch

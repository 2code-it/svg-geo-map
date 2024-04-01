# svg-geo-map
Tools and utilities to map coords to svg elements drawn on a map image.  
Check the source repo for samples (npm run samples).

## Getting started
- [ ] Add the import to svg-geo-map
- [ ] Get a map image and configure it as imageSource
- [ ] Get the map width and height and configure the corresponding options
- [ ] Configure the begin/end latitude/longitude if it's not a world map
- [ ] Add a div element with id='map' and set the containerId option to 'map'
- [ ] Construct the GeoMap

### GeoMapOptions
- width: number, map width should be equal to the used image width, default = 2048
- height: number, map height should be equal to the used image height, default = 1024
- startX: number, left view position when rendered to a container, default = 0
- startY: number, top view position when rendered to container, default = 0
- containerId: string, id of the container element to render the map to, default = undefined
- imageSource: string, source url for the geographic image, default = undefined
- enableDragToScroll: boolean, indication whether dragging is scrolling, default = true
- geoUtilOptions: IGeoUtilOptions, geo util options, default = undefined

### GeoUtilOptions
- latitudeBegin: number, top latitude degree of the map, default = 90
- latitudeEnd: number, bottom latitude degree of the map, default = -90
- longitudeBegin: number, left longitude degree of the map, default = -180
- longitudeEnd: number, right longitude degree of the map, default = 180
- coordDegreePrecision: number, geo coord degree precision, default = 1000000
- viewWidth: number, view width in pixels, default = 1
- viewHeight: number, view width in pixels, default = 1

viewWidth and viewHeight will always be set equal to the map size when using the map geoUtil.  
When not using a world map, begin and end latitude/longitude should be set to mark the corners of the image.  
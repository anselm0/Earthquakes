
accessToken = "pk.eyJ1IjoiYW5zZWxtMCIsImEiOiJjamgzamMzNXIwMzduMnhvM21nOHFnb2tkIn0.m5hJpyBF7EriYe1m2gYv7w"

var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

var plates_url = "https://github.com/fraxen/tectonicplates/blob/master/GeoJSON/PB2002_boundaries.json"

d3.json(url, function(data) {
  createFeatures(data.features);
});

function getColor(m) {
    return m > 5  ? '#d73027' :
           m > 4  ? '#fc8d59' :
           m > 3  ? '#fee08b' :
           m > 2  ? '#d9ef8b' :
           m > 1  ? '#91cf60' :
                    '#1a9850' ;
};


function createFeatures(earthquakeData) {


  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function(feature, layer) {
      var p = feature.properties;

      layer.bindPopup("<h3>" + p.place +
        "</h3><hr><p>" + new Date(p.time) + "</p>");

    },
    pointToLayer: function (feature, latlng) {

      var color, mag, radius;

      mag = feature.properties.mag;


      if (mag === null) {
        color= "#fff";
        radius = 2;
      } else {
        color = getColor(mag);
        radius = 4 * Math.max(mag, 1);
      }

      if (feature.properties.type === 'quarry blast') {
        color = "#f00";
      }

      var marks = L.circleMarker(latlng, {
            color: color,
            opacity: .5,
            weight: 0.25,
            fillColor: color,
            fillOpacity: .6,
            radius: radius
          });

      return marks;
    }


  });

//add the faultline layer
  /*d3.json(plates_url, function(faultData) {
    createFaultFeatures(faultData.features);
  });
*/



  // Sending our layers to the createMap function
  createMap(earthquakes);
};

function createMap(earthquakes) {

  var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1IjoiYW5zZWxtMCIsImEiOiJjamgzamMzNXIwMzduMnhvM21nOHFnb2tkIn0.m5hJpyBF7EriYe1m2gYv7w");

  var dark = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW5zZWxtMCIsImEiOiJjamgzamMzNXIwMzduMnhvM21nOHFnb2tkIn0.m5hJpyBF7EriYe1m2gYv7w");

  var light = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW5zZWxtMCIsImEiOiJjamgzamMzNXIwMzduMnhvM21nOHFnb2tkIn0.m5hJpyBF7EriYe1m2gYv7w");


  var baseMaps = {
    "Outdoors": outdoors,
    "Dark": dark,
    "Light": light

  };

  var overlayMaps = {
    Earthquakes: earthquakes,
    //Faultlines: faultlines
  };

  var map = L.map('map-id', {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [light, earthquakes]
  });

  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'legend'),
          grades = [0, 1, 2, 3, 4, 5],
          labels = [];

      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
  };

  legend.addTo(map);

  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);

};

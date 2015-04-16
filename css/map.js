$(function() {

	$.get('/address.json', function(d) {
		//put code in here
		console.log(d);



	L.mapbox.accessToken = 'pk.eyJ1IjoiYWRkaXNvbnRhbSIsImEiOiJxeG5aX0xVIn0.JnYhW92yIgJvBZzvxQYPWw';
	var map = L.mapbox.map('map', 'examples.map-i86nkdio')
	.setView([d.data[0].lat, d.data[0].lng], 13);
	var map2 = L.mapbox.map('map2', 'examples.map-i86nkdio')
	.setView([d.data[1].lat, d.data[1].lng], 13);
	var featuresH = [];
	var featuresW = [];

	featuresH.push({
	    // this feature is in the GeoJSON format: see geojson.org
	    // for the full specification
	    type: 'Feature',
	    geometry: {
	        type: 'Point',
	        // coordinates here are in longitude, latitude order because
	        // x, y is the standard for GeoJSON and many formats
	        coordinates: [
	          d.data[0].lng, d.data[0].lat
	        ]
	    },
	    properties: {
	        title: ''+d.data[0].name,
	        // one can customize markers by adding simplestyle properties
	        // https://www.mapbox.com/guides/an-open-platform/#simplestyle
	        'marker-size': 'large',
	        'marker-color': '#000',
	        'marker-symbol': 'building'
	    }
	});

	featuresW.push({
	    // this feature is in the GeoJSON format: see geojson.org
	    // for the full specification
	    type: 'Feature',
	    geometry: {
	        type: 'Point',
	        // coordinates here are in longitude, latitude order because
	        // x, y is the standard for GeoJSON and many formats
	        coordinates: [
	          d.data[1].lng, d.data[1].lat
	        ]
	    },
	    properties: {
	        title: ''+d.data[1].name,
	        // one can customize markers by adding simplestyle properties
	        // https://www.mapbox.com/guides/an-open-platform/#simplestyle
	        'marker-size': 'large',
	        'marker-color': '#000',
	        'marker-symbol': 'suitcase'
	    }
	});

	for(var i = 0; i<d.hList.length;i++){
		featuresH.push({
	        type: 'Feature',
	        geometry: {
	            type: 'Point',
	            coordinates: [d.hList[i].lng, d.hList[i].lat]
	        },
	        properties: {
	            'marker-color': '#00F',
	            'marker-symbol': 'star-stroked',
	            title: ''+d.hList[i].name,
	        }
	    });
	}

	for(var j = 0; j<d.wList.length;j++){
		featuresW.push({
	        type: 'Feature',
	        geometry: {
	            type: 'Point',
	            coordinates: [d.wList[j].lng, d.wList[j].lat]
	        },
	        properties: {
	            'marker-color': '#00F',
	            'marker-symbol': 'star-stroked',
	            title: ''+d.wList[j].name,
	            description: ''+d.wList[j].fullAdd
	        }
	    });
	}

	L.mapbox.featureLayer(featuresH).addTo(map);
	L.mapbox.featureLayer(featuresW).addTo(map2);


	 });

});
window.onload = function() {

	L.mapbox.accessToken = '<%= key %>';
	var map = L.mapbox.map('map', 'examples.map-i86nkdio')
	.setView([<%= home.lat %>, <%= home.lng %>], 13);
	var map2 = L.mapbox.map('map2', 'examples.map-i86nkdio')
	.setView([<%= work.lat %>, <%= work.lng %>], 13);
	var features = [];
	features.push({
		    // this feature is in the GeoJSON format: see geojson.org
		    // for the full specification
		    type: 'Feature',
		    geometry: {
		        type: 'Point',
		        // coordinates here are in longitude, latitude order because
		        // x, y is the standard for GeoJSON and many formats
		        coordinates: [
		          <%= home.lng %>, <%= home.lat %>
		        ]
		    },
		    properties: {
		        title: '<%= home.name  %>',
		        description: 'Home location of <%= home.name %>',
		        // one can customize markers by adding simplestyle properties
		        // https://www.mapbox.com/guides/an-open-platform/#simplestyle
		        'marker-size': 'large',
		        'marker-color': '#000',
		        'marker-symbol': 'building'
		    }
		});

	console.log(<%= homeL  %>);
	<% for(var i = 0; i< homeL.length ;i++){ %>
		features.push({
	        type: 'Feature',
	        geometry: {
	            type: 'Point',
	            coordinates: [<%= homeL[i].lng %>, <%= homeL[i].lat %>]
	        },
	        properties: {
	            'marker-color': '#000',
	            'marker-symbol': 'star-stroked',
	            title: '<%= homeL[i].name %>',
	            description: 'Home of <%= homeL[i].name %>'
	        }
	    });
	<%}%>
	console.log(features);
	L.mapbox.featureLayer(features).addTo(map);

	var myMapTwo = L.mapbox.featureLayer({
		    // this feature is in the GeoJSON format: see geojson.org
		    // for the full specification
		    type: 'Feature',
		    geometry: {
		        type: 'Point',
		        // coordinates here are in longitude, latitude order because
		        // x, y is the standard for GeoJSON and many formats
		        coordinates: [
		          <%= work.lng %>, <%= work.lat %>
		        ]
		    },
		    properties: {
		        title: '<%= work.name  %>',
		        description: 'Home location of <%= work.name %>',
		        // one can customize markers by adding simplestyle properties
		        // https://www.mapbox.com/guides/an-open-platform/#simplestyle
		        'marker-size': 'large',
		        'marker-color': '#000',
		        'marker-symbol': 'suitcase'
		    }
		}).addTo(map2);

};
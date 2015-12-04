directionsDisplay = null;
directionsService = null;
map=null;
center = null;
infowindow = null;
home_marker = []
markers = [];
counter = 0;
place_ids = [];
info_windows = [];;


$('.ui.dropdown.start').dropdown({
  onChange: function(value, text){
    console.log("changed");
    var originRequest = {
      query: value
    }
    setMapOnMarkers(markers,null);
    setMapOnMarkers(home_marker, null);
    home_marker = [];
    markers = [];
    place_ids = [];
    var service = new google.maps.places.PlacesService(map);
    service.textSearch(originRequest, function(place, status){
      origin = place[0];
      center = origin.geometry.location
      map.setCenter(center);
      var marker = new google.maps.Marker({
        position: center,
        map: map,
      });
      home_marker.push(marker);
    });
  }
});

$('.search').keypress(function(){
 var service = new google.maps.places.AutocompleteService();
 typed = String($(this).val());
 service.getQueryPredictions({ input: typed }, displayLocationSuggestions);
});

var displayLocationSuggestions = function(predictions, status) {
  $('#starts').empty();
  if (status != google.maps.places.PlacesServiceStatus.OK) {
    alert(status);
    return;
  }
  predictions.forEach(function(prediction) {
    var option = '<div class="item" value="'+prediction.description+'">'+prediction.description+'</option>'
    $('#starts').append(option);
  });
};

$('.ui.button').click(function(){
  search_terms = { 'food' : ["restaurant", "dining", "diner","food", "dinner", "lunch", "breakfast"] ,
  'drinks' : ["bar", "tavern", "pub", "alcohol", "tap", "bars", "club"] ,
  'entertainment' : ["entertainment", "theater", "movie", "arena"],
  'fitness' : ["crossfit","gyms","fitness", "gym" ]}

  var term = $(this).data('value');
  setMapOnMarkers(markers, null);
  searchAndPushPlaces(search_terms[term]);
  map.setZoom(14);
})

function searchAndPushPlaces(search_terms){
 setMapOnMarkers(markers, null);
  markers = [];
  place_ids = [];
 var matrix = new google.maps.DistanceMatrixService;
 $.each(search_terms, function(index, val){
  var request = {
    keyword: val,
    location: center,
    radius: 3000,
  }
  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, function(places, status){
    $.each(places, function(index, val){
      detailsQuery= {
        placeId: val.place_id
      }
      var image={
        url : val.icon,
        scaledSize : new google.maps.Size(30,30),
        origin : new google.maps.Point(0,0),
        anchor: new google.maps.Point(0,0)
      }
      var marker = new google.maps.Marker({
        position: val.geometry.location,
        map: map,
        icon : image
      });
      place_ids.push(val.place_id);
      markers.push(marker);
      markerClickHandler(counter)
      counter ++;
      });
    });
  });
}

name_address ="";
time_string ="";

markerClickHandler = function(i) {
          markers[i].addListener('click', function(e){
          $.each(info_windows, function(index, val){
            val.close();
          })
          var matrix = new google.maps.DistanceMatrixService;
          var service = new google.maps.places.PlacesService(map);
          var geocoder = new google.maps.Geocoder;
          showDirections(center, e.latLng);
          matrix.getDistanceMatrix({
            origins: [center],
            destinations : [e.latLng],
            travelMode: google.maps.TravelMode.DRIVING,
            },
            function(response, status){
              elements = response.rows[0].elements[0];
              var miles = (elements.distance.value/1000) * 0.621371
              miles = String(miles).substring(0,4)
              time_string = "<p>" + miles + " miles:</p><p>" + elements.duration.text + " driving</p>";
              service.getDetails({placeId: place_ids[i]}, function(detail, index){
              name_address = "<p>"+ detail.name + "</p><p>" + detail.formatted_address + "</p><p> Rating: " + detail.rating +"</p>"
              var infowindow = new google.maps.InfoWindow({
              content: "<div>" + name_address +"" + time_string + "</div>"
              });
         infowindow.open(map, markers[i]);
         info_windows.push(infowindow);
                });
              });
            });
          };



function setMapOnMarkers(markers, map){
  if(markers.length > 1){
    counter = 0;
  }
  $.each(markers, function(index, val){
    val.setMap(map);
  })
}

function showDirections(start, end){
  directionsService.route({
    origin: start,
    destination: end,
    travelMode: google.maps.TravelMode.DRIVING
  }, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsDisplay.setOptions({ preserveViewport: true });
      directionsDisplay.setDirections(response);
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

function initMap() {
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 12
  });

  directionsDisplay.setMap(map);
  infoWindow = new google.maps.InfoWindow({map: map});

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      console.log(position);
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      center = pos;
      var marker = new google.maps.Marker({
        position: pos,
        map: map,
        title: 'Hello World!'
      });
      home_marker.push(marker);
      infoWindow.setPosition(pos);
      var geocoder = new google.maps.Geocoder;
      geocoder.geocode({location: pos}, function(results, status){
        infoWindow.setContent(results[0].formatted_address);
      });
      info_windows.push(infoWindow);
      map.setCenter(pos);
    }, function() {
      handleLocationError(true, infoWindow, map.getCenter());
    });
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindow, map.getCenter());
  }

}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(browserHasGeolocation ?
    'Error: The Geolocation service failed.' :
    'Error: Your browser doesn\'t support geolocation.');
}










function initMap() {
  var mapword = document.getElementById('mappos').value;
  var maparray = mapword.split(',');
  var latitude = parseFloat(maparray[0]);
  var longitude =  parseFloat(maparray[1]);
  var myLatLng = {lat: latitude, lng:longitude};

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 16,
    center: myLatLng
  });

  var marker = new google.maps.Marker({
    position: myLatLng,
    map: map
  });
  }
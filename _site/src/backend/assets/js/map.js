
  let mapword = document.getElementById('mappos').value;
  let maparray = mapword.split(',');
  let latitude = parseFloat(maparray[0]);
  let longitude =  parseFloat(maparray[1]);
  let myLatLng = {lat: latitude, lng:longitude};
  let myLngLat = {lng: longitude, lat:latitude};
  let map;
  let googleMarker;
  let osmMarker;
  const theme   = parseInt(document.getElementById('theme').value);
  const mapType = parseInt(document.getElementById('mapType').value);
  
  //  Selects the type of map - OSM OR Google maps 
  if(mapType)
    {
      if(theme){
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 16,
          center: myLatLng,
          styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
          },
          {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
          }
          ]
        });
      } else{
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 16,
          center: myLatLng
        });
      }

      googleMarker = new google.maps.Marker({
        position: myLatLng,
        map: map
      });

    } else{

      mapboxgl.accessToken = 'pk.eyJ1IjoiaGFyc2hrYXNoeWFwIiwiYSI6ImNqbjc0ZGRpcDAxZGIzcHA4MHduN3dkdDgifQ.YO4DvPlp5O7VTvlB0K4d0Q';
        
      if(theme){
        map = new mapboxgl.Map({
          container: 'map',
          zoom: 16,
          center : myLngLat,
          scrollZoom : false,
          style: 'mapbox://styles/mapbox/navigation-preview-night-v4'
        });
      } else{
        map = new mapboxgl.Map({
          container: 'map',
          zoom: 16,
          center : myLngLat,
          scrollZoom : false,
          // style: 'mapbox://styles/mapbox/streets-v10'
          style: 'mapbox://styles/mapbox/navigation-preview-day-v4'
        });        
      }

      osmMarker = new mapboxgl.Marker()
          .setLngLat(myLngLat)
          .addTo(map);
      
      var nav = new mapboxgl.NavigationControl();
      map.addControl(nav, 'bottom-right');
      map.addControl(new mapboxgl.FullscreenControl());
    }
let apiKey = "";

async function getInfo() {
  let response = await fetch("/.netlify/functions/asset-locator");
  apiKey = await response.json();
  showMap();
}

getInfo();

function showMap() {
  const basemapEnum = "e16f851bdec647edba0498e186a5329c";

  const map = L.map("map", {
    minZoom: 14,
  });

  map.setView([51.5072, -0.1186], 14);

  L.esri.Vector.vectorBasemapLayer(basemapEnum, {
    apiKey: apiKey,
  }).addTo(map);

  const searchControl = L.esri.Geocoding.geosearch({
    position: "topright",
    placeholder: "Enter an address or place e.g. 1 York St",
    useMapBounds: false,

    providers: [
      L.esri.Geocoding.arcgisOnlineProvider({
        apikey: apiKey,
        nearby: {
          lat: -33.8688,
          lng: 151.2093,
        },
      }),
    ],
  }).addTo(map);

  searchControl.on("results", (data) => {
    map.setView(data.latlng, 14);
    showPlaces();
  });

  const layerGroup = L.layerGroup().addTo(map);

  function showPlaces() {
    let position;
    L.esri.Geocoding.geocode({
      apikey: apiKey,
    })
      .category("Post Office")
      .nearby(map.getCenter(), 10)

      .run(function(error, response) {
        if (error) {
          return;
        }
        layerGroup.clearLayers();
        response.results.forEach((searchResult) => {
          position = new L.LatLng(
            searchResult.latlng.lat,
            searchResult.latlng.lng
          );
          L.marker(searchResult.latlng)
            .addTo(layerGroup)
            .bindPopup(
              `<b>${searchResult.properties.PlaceName}</b></br>${searchResult.properties.Place_addr}<br/>${searchResult.properties.Phone}<br/>${searchResult.properties.URL}`
            );
        });
      });
    map.setView(position, 14);
  }

  showPlaces();
}

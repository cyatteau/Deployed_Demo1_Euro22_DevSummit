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

  const results = L.layerGroup().addTo(map);
  searchControl.on("results", (data) => {
    results.clearLayers();
    for (let i = data.results.length - 1; i >= 0; i--) {
      const lat = data.results[i].latlng.lat;
      const long = data.results[i].latlng.lng;
      map.setView(new L.LatLng(lat, long), 14);
    }
    showPlaces();
  });

  const layerGroup = L.layerGroup().addTo(map);

  function showPlaces() {
    let position;
    L.esri.Geocoding.geocode({
      apikey: apiKey,
    })
      .category("Post Office")
      .nearby(map.getCenter(), 1)
      .run(function(error, response) {
        for (const result of response.results) {
          position = new L.LatLng(result.latlng.lat, result.latlng.lng);
          new L.marker(result.latlng).addTo(layerGroup).bindTooltip(() => {
            return L.Util.template(
              `<b>${result.properties.PlaceName}</b></br>${result.properties.Place_addr}<br/>${result.properties.Phone}<br/>${result.properties.URL}`
            );
          });
        }
      });
    map.setView(position, 14);
  }
  showPlaces();
}


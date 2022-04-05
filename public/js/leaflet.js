/* eslint-disable */

//adding a map to our tours page
//reading the locations from the dataset property
const locations = JSON.parse(document.getElementById('map').dataset.locations);

//creating our map in our div
let map = L.map('map', { zoomControl: false });

//creating a style layer for our map and adding it to our map
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

const points = [];

locations.forEach(loc => {
  //adding our coordinates to points array
  points.push([loc.coordinates[1], loc.coordinates[0]]);

  //creating a marker for each coordinate, adding it to our map and creating a message for each marker with the day and description
  L.marker([loc.coordinates[1], loc.coordinates[0]])
    .addTo(map)
    .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
      autoClose: false
    })
    .openPopup();
});

//specifying map bounds to include current locations
const bounds = L.latLngBounds(points).pad(0.5);
map.fitBounds(bounds);

//disabling zoom in our map
map.scrollWheelZoom.disable();

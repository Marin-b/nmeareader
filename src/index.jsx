/* eslint-disable */

import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import Websocket from 'react-websocket';
import mapboxgl from 'mapbox-gl';
import GPS from 'gps';
import usb from 'usb';
import '../assets/stylesheets/application.scss';

const root = document.getElementById('root');

// create map container component
class MapBox extends Component {
  constructor(props) {
    super (props);

    this.state = {

    }
  }

  render () {
    return (
      <div id="map">
      <button id="findMyBoat">find my boat</button></div>
    )
  }
}

// append map container
if (root) {
  ReactDOM.render(
   <MapBox />, root
   )
}

// initialize mapbox
const initMapbox = () => {
  const mapElement = document.getElementById('map');

  if (mapElement) { // only build a map if there's a div#map to inject into
    mapboxgl.accessToken = "pk.eyJ1IjoibWFyaW5iIiwiYSI6ImNqc2VpMWoxYTAwMXA0M3FtbGd4cnhxczQifQ.grMNCYr2lERdzklEWPyzxg";
    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v10'
    });
  }
};
const mapdata = {
        "type": "FeatureCollection",
        "features": [{
          "type": "Feature",
          "geometry": {
            "type": "LineString",
            "coordinates": []
          }
        }]
      }

const boatIconSource = {
    "type": "FeatureCollection",
    "features": [{
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "Point",
        "coordinates": []
      }
    }]
  };

let map
initMapbox();
map.on('load', function () {
  map.addSource(
    'trace',{
      "type": 'geojson',
      "data": mapdata }
  )
  map.addLayer({
    "id": "trace",
    "type": "line",
    "source": "trace",
    "paint": {
      "line-color": "red",
      "line-opacity": 1,
      "line-width": 5
    }
  });

  map.addSource('boatSource', {
    "type": "geojson",
    "data": boatIconSource
  });
  let angle = 0

  map.addLayer({
    "id": "boatLayer",
    "source": "boatSource",
    "type": "symbol",
    "layout": {
      "icon-image": "airport-15",
      "icon-rotate": 0,
      "icon-allow-overlap": true,
      "icon-ignore-placement": true
    },
    "paint": {
      "icon-color" : "white"
    }
  });


  let position = []
  const exampleSocket = new WebSocket('ws://127.0.0.1:55555', "TCP")

  const updateTrail = () => {
    mapdata.features[0].geometry.coordinates.push(position)
    map.getSource('trace').setData(mapdata);
  };

  const findMyBoat = document.getElementById('findMyBoat');

  findMyBoat.addEventListener("click", (event) => {
    map.jumpTo({ 'center': position, 'zoom': 14 })
  } )

  const boatPosition = () => {
    boatIconSource.features[0].geometry.coordinates = position
    map.getSource('boatSource').setData(boatIconSource);
  }

  const renderGPS = () => {
    console.log(position)
    updateTrail();
    boatPosition();
  }

  exampleSocket.onmessage = function (event) {
    const sentences = event.data.split("\n")
    console.log(sentences)
    sentences.forEach((sentence) => {
      if (sentence.includes("GPRMC")) {
        const arr = sentence.split(',')
        // check if sentence = valid
        if(arr[2] === "A"){
          const latNotParsed = arr[3].replace('.', '')
          const longNotParsed = arr[5].replace('.', '')
          const lat = arr[4] === "N" ? parseFloat(latNotParsed.slice(0, 2) + "." +latNotParsed.slice(2,6)) : parseFloat("-" + latNotParsed.slice(0, 2) + "." +latNotParsed.slice(2,7))
          const long = arr[6] === "E" ? parseFloat(longNotParsed.slice(0, 2) + "." +longNotParsed.slice(2,6)) : parseFloat("-" + longNotParsed.slice(0, 3) + "." +longNotParsed.slice(3,8))
          position = [long, lat]
        }
      }
    });
    renderGPS();
  }
});






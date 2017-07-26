import React from 'react';

import ImageScaleMapType from '../../utils/ImageScaleMapType';

export default class TowerOfHeraMap extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.floors = ['B1', '1F', '2F', '3F', '4F', '5F', '6F'];
    this.mapName = 'tower-of-hera';

    this.loadImages = this.loadImages.bind(this);
    this.handleMapIdChange = this.handleMapIdChange.bind(this);
    this.initMap = this.initMap.bind(this);

    this.google = props.google;
  }

  componentDidMount() {
    this.loadImages().then((images) => {
      this.initMap(images);
    });
  }

  loadImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.crossOrigin = "Anonymous";
      img.src = url;
    });
  }

  loadImages() {
    const imgUrl = IMAGE_URL; // eslint-disable-line
    const floorPromises = this.floors.map(floor => {
      return this.loadImage(`${imgUrl}dungeons/${this.mapName}/${floor}.png`);
    });
    const basePromise = this.loadImage(`${imgUrl}dungeons/${this.mapName}/base.png`);
    return Promise.all([...floorPromises, basePromise]);
  }

  handleMapIdChange() {
    // Do nothing for now
  }

  initMap(floorImages) {

    // Initialize the Google map
    const map = this.map = new this.props.google.maps.Map(document.querySelector('#google-map'), {
      center: {lat: 70, lng: -90},
      zoom: 0,
      streetViewControl: false,
      mapTypeControlOptions: {
        mapTypeIds: [...this.floors]
      }
    });

    // Set maximum pan area in lat lng
    const allowedBounds = new this.google.maps.LatLngBounds( // eslint-disable-line
      new this.google.maps.LatLng(-0, -179),
      new this.google.maps.LatLng(85, 0)
    );

    // Add an event listener for when the Map Type changes
    map.addListener('maptypeid_changed', this.handleMapIdChange.bind(this, map));

    const base = floorImages.pop();
    // Create map types and set them to the map
    this.floors.forEach((floor, index) => {
      const mapType = this.createMapType(floor, floorImages[index], base);
      map.mapTypes.set(floor, mapType);
    });

    // Set the default Map Type to the entry floor
    map.setMapTypeId('2F');

    // Restrict the pan area (should merge with allowedBounds??)
    // this.props.setPanBounds(map, allowedBounds);
  }

  createMapType(name, image, base) {
    return new ImageScaleMapType(
      image,
      base,
      new google.maps.Size(256, 256), // eslint-disable-line
      2,
      0,
      name
    );
  }

  render() {
    return (
      <div id="map">
        <div id="google-map" />
      </div>
    );
  }
}
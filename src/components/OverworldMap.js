import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Overlay from './Overlay';
import LootMarker from './LootMarker';
import * as actions from '../actions/mapActions';

class OverworldMap extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.google = props.google;

    this.state = {
      overlays: []
    };

    this.componentDidMount = this.componentDidMount.bind(this);
    this.getProps = this.getProps.bind(this);
    this.initMap = this.initMap.bind(this);
    this.addMarkers = this.addMarkers.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleMapIdChange = this.handleMapIdChange.bind(this);
  }

  componentDidMount() {
    this.initMap(this.props);
  }

  handleMapIdChange(map) {
    this.props.actions.updateMapTypeId(map.getMapTypeId());
  }

  handleClick(e) {
    // Output coords on click
    console.log(e.latLng.lat().toFixed(4) +', '+ e.latLng.lng().toFixed(4)); // eslint-disable-line
  }

  getProps() {
    return {
      tracker: this.props.tracker
    };
  }

  setPanBounds(map) {
    const allowedBounds = new this.google.maps.LatLngBounds(
      new this.google.maps.LatLng(-0, -179),
      new this.google.maps.LatLng(85, 0)
    );

    this.props.setPanBounds(map, allowedBounds);
  }

  initMap(props) {
    const map = this.map = new props.google.maps.Map(document.getElementById('google-map'), {
      center: {lat: 70, lng: -90},
      zoom: props.zoomBuffer + 2,
      streetViewControl: false,
      mapTypeControlOptions: {
        mapTypeIds: ['lightworld', 'darkworld']
      }
    });

    map.addListener('click', this.handleClick);
    map.addListener('maptypeid_changed', this.handleMapIdChange.bind(this, map));

    const lightWorld = props.createMapType('lightworld', 'Light World', [4, 8, 16, 32]);
    const darkWorld = props.createMapType('darkworld', 'Dark World', [4, 8, 16, 32]);

    map.mapTypes.set('lightworld', lightWorld);
    map.mapTypes.set('darkworld', darkWorld);
    map.setMapTypeId('lightworld');

    this.setPanBounds(map);
    this.addMarkers();
  }

  addMarkers() {
    const overlays = this.props.map.markers.map((data, i) => (
      <Overlay
        key={i}
        map={this.map}
        google={this.props.google}
        position={new this.props.google.maps.LatLng(...data.coords)}
      >
        <LootMarker
          data={data}
          lootIndex={i}
          getProps={this.getProps}
          tracker={this.props.tracker}
          store={this.props.route.store}
        />
      </Overlay>
    ));
    this.setState({overlays});
  }

  render() {
    return (
      <div id="map">
        <div id="google-map" />
        {this.state.overlays}
      </div>
    );
  }
}

export default connect(
  state => ({
    map: state.map,
    tracker: state.itemTracker,
  }),
  dispatch => ({actions: bindActionCreators(actions, dispatch)})
)(OverworldMap);

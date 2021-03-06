var React = require('react-native');
var NativeModules = require('NativeModules');
var ReactIOSViewAttributes = require('ReactIOSViewAttributes');
var StyleSheet = require('StyleSheet');
var createReactIOSNativeComponentClass = require('createReactIOSNativeComponentClass');
var PropTypes = require('ReactPropTypes');
var StyleSheetPropType = require('StyleSheetPropType');
var NativeMethodsMixin = require('NativeMethodsMixin');
var flattenStyle = require('flattenStyle');
var merge = require('merge');

var {
	DeviceEventEmitter,
} = React;

var BarcodeScanner = React.createClass({
  propTypes: {
    onScanned: PropTypes.func.isRequired,
    aspect: PropTypes.string,
    type: PropTypes.string,
    orientation: PropTypes.string,
  },

  mixins: [NativeMethodsMixin],

  viewConfig: {
    uiViewClassName: 'UIView',
    validAttributes: ReactIOSViewAttributes.UIView
  },

  getInitialState: function() {
    return {
      isAuthorized: false,
      aspect: this.props.aspect || 'Fill',
      type: this.props.type || 'Back',
      orientation: this.props.orientation || 'Portrait'
    };
  },

  componentWillMount: function() {
    NativeModules.BarcodeScannerManager.checkDeviceAuthorizationStatus((function(err, isAuthorized) {
      this.state.isAuthorized = isAuthorized;
      this.setState(this.state);
    }).bind(this));
  },

  componentDidMount: function() {
    console.log('Mounted');
    var subscription = DeviceEventEmitter.addListener(
      'scanned',
      (value) => { console.log(value); this.props.onScanned(value); } );
    },

  componentDidUmnount: function() {
    subscription.remove();
    this.stopScanning();
    console.log('Umounted');
  },

  render: function() {
    var style = flattenStyle([styles.base, this.props.style]);

    aspect = NativeModules.BarcodeScannerManager.aspects[this.state.aspect];
    type = NativeModules.BarcodeScannerManager.cameras[this.state.type];
    orientation = NativeModules.BarcodeScannerManager.orientations[this.state.orientation];

    var nativeProps = merge(this.props, {
      style,
      aspect: aspect,
      type: type,
      orientation: orientation,
    });

    return <RCTBarcodeScanner {... nativeProps} />
  },

  switch: function() {
    this.state.type = this.state.type == 'Back' ? 'Front' : 'Back';
    this.setState(this.state);
  },

  startScanning: function() {
    NativeModules.BarcodeScannerManager.startScanning();
  },

  stopScanning: function() {
    NativeModules.BarcodeScannerManager.stopScanning();
  }
});

var RCTBarcodeScanner = createReactIOSNativeComponentClass({
  validAttributes: merge(ReactIOSViewAttributes.UIView, {
    aspect: true,
    type: true,
    orientation: true
  }),
  uiViewClassName: 'RCTBarcodeScanner',
});

var styles = StyleSheet.create({
  base: { },
});

module.exports = BarcodeScanner;
/**
 * Add all your dependencies here.
 *
 * @require widgets/Viewer.js
 * @require plugins/LayerManager.js
 * @require plugins/OLSource.js
 * @require plugins/OSMSource.js
 * @require plugins/BingSource.js
 * @require plugins/GoogleSource.js
 * @require plugins/WMSCSource.js
 * @require plugins/MapQuestSource.js
 * @require plugins/Zoom.js
 * @require plugins/ZoomToLayerExtent.js
 * @require plugins/AddLayers.js
 * @require plugins/RemoveLayer.js
 * @require plugins/WMSGetFeatureInfo.js
 * @require plugins/Print.js
 * @require plugins/GoogleEarth.js
 * @require plugins/LayerProperties.js
 * @require plugins/Measure.js
 * @require plugins/FeatureEditor.js 
 * @require plugins/FeatureManager.js 
 * @require plugins/Styler.js 
 * @require widgets/WMSLayerPanel.js
 * @require widgets/ScaleOverlay.js
 * @require widgets/GoogleEarthPanel.js
 * @require RowExpander.js
 * @require RowLayout.js
 * @require GeoExt/widgets/PrintMapPanel.js
 * @require GeoExt/widgets/LayerOpacitySlider.js
 * @require GeoExt/plugins/PrintProviderField.js
 * @require GeoExt/plugins/PrintPageField.js
 * @require GeoExt/plugins/PrintExtent.js
 * @require OpenLayers/Layer.js
 * @require OpenLayers/Layer/WMTS.js
 * @require OpenLayers/Handler/Path.js
 * @require OpenLayers/Handler/Point.js
 * @require OpenLayers/Handler/Polygon.js
 * @require OpenLayers/Renderer.js
 * @require OpenLayers/Renderer/SVG.js 
 * @require OpenLayers/Renderer/VML.js 
 * @require OpenLayers/Renderer/Canvas.js 
 * @require OpenLayers/StyleMap.js
 * @require OpenLayers/Feature/Vector.js
 * @require OpenLayers/Console.js
 * @require OpenLayers/Lang.js 
 * @require OpenLayers/Layer/Vector.js
 * @require OpenLayers/Layer/OSM.js
 * @require OpenLayers/Layer/TMS.js
 * @require OpenLayers/Marker.js 
 * @require OpenLayers/Popup/Anchored.js 
 * @require OpenLayers/Format/KML.js
 * @require OpenLayers/Format/GeoRSS.js
 * @require OpenLayers/Layer/GeoRSS.js
 * @require OpenLayers/Control/ScaleLine.js
 * @require OpenLayers/Control/Zoom.js
 * @require OpenLayers/Projection.js
 * @require PrintPreview.js
 * @require OpenLayers/StyleMap.js
 * @require OpenLayers/Strategy.js
 * @require OpenLayers/Strategy/BBOX.js
 * @require OpenLayers/Protocol.js
 * @require OpenLayers/Protocol/WFS.js
 * @require OpenLayers/Filter.js
 * @require OpenLayers/Filter/Comparison.js
 * @require OpenLayers/Request/XMLHttpRequest.js
 *
 * @require underscore.js
 *
 * @require overrides/OpenLayers/Map.js
 * @require overrides/OpenLayers/Control/WMSGetFeatureInfo.js
 * @require overrides/OpenLayers/Format/XML.js
 * @require overrides/OpenLayers/Format/WMSGetFeatureInfo.js
 * @require overrides/OpenLayers/Layer/GeoRSS.js
 *
 * @require overrides/gxp/plugins/Print.js
 * @require overrides/ext/widgets/grid/PropertyGrid.js
 * @require overrides/ext/dd/DragTracker.js
 * @require overrides/gxp/plugins/FeatureEditor.js
 * @require overrides/gxp/plugins/AddLayers.js
 * @require overrides/gxp/plugins/Measure.js
 * @require overrides/geoext/plugins/TreeNodeComponent.js
 * @require overrides/geoext/widgets/LayerOpacitySlider.js
 * @require overrides/geoext/widgets/PrintMapPanel.js
 * @require overrides/geoext/widgets/WMSLegend.js
 * @require overrides/geoext/data/PrintProvider.js
 * @require overrides/gxp/plugins/LayerTree.js
 * @require overrides/gxp/plugins/Styler.js
 * @require overrides/gxp/plugins/WMSSource.js
 * @require overrides/gxp/widgets/WMSLayerPanel.js
 * @require overrides/gxp/plugins/WMSGetFeatureInfo.js
 * @require overrides/gxp/plugins/LayerManager.js
 * @require overrides/gxp/widgets/ScaleOverlay.js
 * @require overrides/gxp/widgets/Viewer.js
 *
 * @require helpers.js
 * @require loadJSFile.js
 * @require searchRecordSelectHandler.js
 * @require buildWFSLayer.js
 * @require buildWestPanel.js
 * @require buildComboStore.js
 * @require buildAllFeaturesDataStore.js
 * @require addDefaultTabs.js
 * @require doClearHighlight.js
 * @require buildAccordion.js
 * @require buildTabExpand.js
 * @require buildTabCollapse.js
 * @require buildNorthPart.js
 * @require buildEastPanel.js
 * @require buildPortalItems.js
 * @require loadTabConfig.js
 * @require buildApp.js
 * @require buildFeaturesAddedHandler.js
 * @require addOpacitySlider.js
 * @require initAuthorization.js
 * @require onConfigurationLoaded.js
 * @require requestConfig.js
 */

var app;
var gCombostore; // store powering northPart dropdown
var gComboDataArray = { value: [] }; // maybe don't need this if we have the gCombostore (?)
var eastPanel;
var westPanel;
var northPart;
var gLayoutsArr; // for each layer (e.g. property address), lists additional tabs
var gCurrentExpandedTabIdx = []; // index of currently opened tab, per layer (feature type)
var gCurrentLoggedRole = { value: "NONE" }; // 'NONE', 'admin','planning' - currently logged in username

// Google Analytics - start
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-27881682-2', 'pozi.com');
ga('send', 'pageview');
// Google Analytics - end

// http://stackoverflow.com/questions/18912932/object-keys-not-working-in-internet-explorer
if (!Object.keys) {
  Object.keys = function(obj) {
    var keys = [];

    for (var i in obj) {
      if (obj.hasOwnProperty(i)) {
        keys.push(i);
      }
    }

    return keys;
  };
}

// http://stackoverflow.com/questions/7153470/why-wont-filter-work-in-interent-explorer-8
if (!Array.prototype.filter)
{
  Array.prototype.filter = function(fun /*, thisp */)
  {
    "use strict";

    if (this === void 0 || this === null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun !== "function")
      throw new TypeError();

    var res = [];
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t)
      {
        var val = t[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, t))
          res.push(val);
      }
    }

    return res;
  };
}

Ext.onReady(function() {
    requestConfig({
        onLoad: function(clientConfig, propertyDataInit) {
            JSONconf = clientConfig; // This is still necessary because JSONconf is used as a global in some gxp overrides.
            onConfigurationLoaded(clientConfig, propertyDataInit);
        }
    })
});


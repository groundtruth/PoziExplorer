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
 * @require plugins/LayerProperties.js
 * @require plugins/Measure.js
 * @require plugins/FeatureEditor.js 
 * @require plugins/FeatureManager.js 
 * @require plugins/Styler.js 
 * @require widgets/WMSLayerPanel.js
 * @require widgets/ScaleOverlay.js
 * @require RowExpander.js
 * @require RowLayout.js
 * @require GeoExt/widgets/PrintMapPanel.js
 * @require GeoExt/plugins/PrintProviderField.js
 * @require GeoExt/plugins/PrintPageField.js
 * @require GeoExt/plugins/PrintExtent.js
 * @require OpenLayers/Layer.js
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
 * @require overrides/ext/widgets/grid/PropertyGrid.js
 * @require overrides/gxp/plugins/FeatureEditor.js
 * @require overrides/gxp/plugins/AddLayers.js
 * @require overrides/geoext/plugins/TreeNodeComponent.js
 * @require overrides/gxp/plugins/LayerTree.js
 * @require overrides/gxp/plugins/WMSSource.js
 * @require overrides/gxp/widgets/WMSLayerPanel.js
 * @require overrides/gxp/plugins/WMSGetFeatureInfo.js
 *
 * @require helpers.js
 * @require onConfigurationLoaded.js
 */

var gtProxy,
    gtLoginEndpoint,
    gtLocalLayerSourcePrefix;
var debugMode = (/(localhost|\.dev|\.local)/i).test(window.location.hostname);

if (debugMode)
{
    gtProxy = "proxy/?url=";
    gtLoginEndpoint = "http://v3.pozi.com/geoexplorer/login/";
    gtLocalLayerSourcePrefix = "http://v3.pozi.com";
}
else
{
    gtProxy = "/geoexplorer/proxy/?url=";
    gtLoginEndpoint = "/geoexplorer/login";
    gtLocalLayerSourcePrefix = "";
}

var app;
var glayerLocSel,
    gComboDataArray = [],
    gfromWFS,
    clear_highlight,
    gCombostore,
    gCurrentExpandedTabIdx = [],
    gCurrentLoggedRole = "NONE",
    JSONconf,
    propertyDataInit,
    gtLayerPresentationConfiguration,
    eastPanel,
    westPanel,
    northPart,
    gLayoutsArr,
    gLoggedUsername,
    gLoggedPassword,
    gtZoomMax,
    gtHideSelectedFeaturePanel,
    add_default_tabs;
var poziLinkClickHandler;
var vector_layer = new OpenLayers.Layer.Vector("WKT", {
        displayInLayerSwitcher: false
    });
var wkt_format = new OpenLayers.Format.WKT();
var gtLayerLabel;

Ext.onReady(function() {

    // Extraction of parameters from the URL to load the correct configuration file, and an optional property number to focus on
    function getURLParameter(name) {
        return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, ''])[1]
        );
    }

    // Extracting parameters values: config and property
    var configScript = getURLParameter('config');
    var propnum = getURLParameter('property');

    // If the URL does not offer itself to splitting according to the rules above, it means, we are having Apache clean URL: http://www.pozi.com/mitchell/property/45633
    // We extract the information according to this pattern
    if (! (configScript))
    {
        // We extract the end of the URL
        // This will no longer work when we consider saved maps
        var urlquery = location.href.split("/");
        if (urlquery[urlquery.length - 2])
        {
            if (urlquery[urlquery.length - 2] == "property")
            {
                configScript = urlquery[urlquery.length - 3];
                propnum = urlquery[urlquery.length - 1];
            }
            else
            {
                configScript = urlquery[urlquery.length - 1];
            }
        }
    }

    // Loading the JSON configuration based on the council name
    OpenLayers.Request.GET({
        url: "lib/custom/json/" + configScript + ".json",
        success: function(request) {
            // Decoding the configuration file - it's a JSON file
            JSONconf = Ext.util.JSON.decode(request.responseText);
            // If a property number has been passed
            if (propnum)
            {
                // Handler for result of retrieving the property details by its number
                var prop_by_prop_num_handler = function(request) {
                    // The first row returned contains our property record
                    // We populate the global variable with that
                    if (request.data && request.data.items[0])
                    {
                        propertyDataInit = request.data.items[0].json.row;
                    }
                    else
                    {
                        alert("No property found in " + toTitleCase(configScript) + " with number: " + propnum + ".");
                    }

                    onConfigurationLoaded();
                };

                var ds = new Ext.data.JsonStore({
                    autoLoad: true,
                    //autoload the data
                    root: 'rows',
                    baseParams: {
                        query: propnum,
                        config: JSONconf.databaseConfig,
                        lga: JSONconf.LGACode
                    },
                    fields: [{
                        name: "label",
                        mapping: "row.label"
                    },
                    {
                        name: "xmini",
                        mapping: "row.xmini"
                    },
                    {
                        name: "ymini",
                        mapping: "row.ymini"
                    },
                    {
                        name: "xmaxi",
                        mapping: "row.xmaxi"
                    },
                    {
                        name: "ymaxi",
                        mapping: "row.ymaxi"
                    },
                    {
                        name: "gsns",
                        mapping: "row.gsns"
                    },
                    {
                        name: "gsln",
                        mapping: "row.gsln"
                    },
                    {
                        name: "idcol",
                        mapping: "row.idcol"
                    },
                    {
                        name: "idval",
                        mapping: "row.idval"
                    },
                    {
                        name: "ld",
                        mapping: "row.ld"
                    }
                    ],
                    proxy: new Ext.data.ScriptTagProxy({
                        url: JSONconf.servicesHost + "/ws/rest/v3/ws_property_id_by_propnum.php"
                    }),
                    listeners: {
                        load: prop_by_prop_num_handler
                    }
                });

            }
            else
            {
                onConfigurationLoaded();
            }
        },
        failure: function(request) {
            var obj;
            try {
                obj = Ext.util.JSON.decode(request.responseText);
            } catch(err) {
                // pass
                }
            var msg = this.loadConfigErrorText;
            if (obj && obj.error) {
                msg += obj.error;
            } else {
                msg += this.loadConfigErrorDefaultText;
            }
            this.on({
                ready: function() {
                    this.displayXHRTrouble(msg, request.status);
                },
                scope: this
            });
        },
        scope: this
    });

});


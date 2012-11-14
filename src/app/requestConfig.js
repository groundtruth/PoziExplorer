function requestConfig(options) {	

    var configScript = Ext.urlDecode(location.search.substr(1))['config'];
    var propNum = Ext.urlDecode(location.search.substr(1))['property'];

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
                propNum = urlquery[urlquery.length - 1];
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

            var defaultConf = {
                servicesHost: "http://49.156.17.41",
                searchEndPoint: "/ws/rest/v3/ws_all_features_by_string_and_lga.php",
                WFSEndPoint: "/geoserver/wfs",
                LGACode: "346",
                workspace: "",
                highlightSymboliser: {
                    name: "test",
                    strokeColor: "yellow",
                    strokeWidth: 15,
                    strokeOpacity: 0.5,
                    fillColor: "yellow",
                    fillOpacity: 0.2
                },
                logoClientSrc: "http://www.pozi.com/theme/app/img/mitchell_banner.jpg",
                logoClientWidth: 238,
                zoomMax: 18,
                bannerLineColor: "#A0A0A0",
                bannerRightCornerLine1: "Mitchell Shire Council",
                bannerRightCornerLine2: "Victoria, Australia",
                printMapTitle: "",
                linkToCouncilWebsite: "http://www.mitchellshire.vic.gov.au/",
                quickZoomDatastore: [],
                collapseWestPanel: false,
                hideNorthRegion: false,
                hideSelectedFeaturePanel: false,
                eastPanelCollapsed: false,
                hideLayerPanelButton: false,
                mapContexts: [{
                    name: "Property Map",
                    size: 120
                }],
                reloadOnLogin: false,
                openFirstDefaultTab: false,
                databaseConfig: "vicmap", // Datastore definition for the web service search results
                layerPresentation: {},
                WFSsrsName: "EPSG:4326",
                WFSgeometryName: "the_geom",
                FeatureNS: "http://www.pozi.com/vicmap"
            };

            var loadedConf = Ext.util.JSON.decode(request.responseText);
            var JSONconf = {}
            Ext.apply(JSONconf, loadedConf, defaultConf)

            if (propNum)
            {
                var ds = new Ext.data.JsonStore({
                    autoLoad: true,
                    root: 'rows',
                    baseParams: {
                        query: propNum,
                        config: JSONconf.databaseConfig,
                        lga: JSONconf.LGACode
                    },
                    fields: [
                        { name: "label", mapping: "row.label" },
                        { name: "xmini", mapping: "row.xmini" },
                        { name: "ymini", mapping: "row.ymini" },
                        { name: "xmaxi", mapping: "row.xmaxi" },
                        { name: "ymaxi", mapping: "row.ymaxi" },
                        { name: "gsns",  mapping: "row.gsns" },
                        { name: "gsln",  mapping: "row.gsln" },
                        { name: "idcol", mapping: "row.idcol" },
                        { name: "idval", mapping: "row.idval" },
                        { name: "ld",    mapping: "row.ld" }
                    ],
                    proxy: new Ext.data.ScriptTagProxy({
                        url: JSONconf.servicesHost + "/ws/rest/v3/ws_property_id_by_propnum.php"
                    }),
                    listeners: {
                        load: function(request) {
                            if (request.data && request.data.items[0]) {
                                propertyDataInit = request.data.items[0].json.row; // property record
                            } else {
                                alert("No property found in " + helpers.toTitleCase(configScript) + " with number: " + propNum + ".");
                            }

                            options.onLoad(JSONconf);
                        }
                    }
                });
            }
            else
            {
                options.onLoad(JSONconf);
            }
        },
        failure: function(request) { alert("Configuration data could not be loaded!"); },
        scope: this
    });
};

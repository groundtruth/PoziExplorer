/**
 * Copyright (c) 2008-2011 The Open Planning Project
 * 
 * Published under the GPL license.
 * See https://github.com/opengeo/gxp/raw/master/license.txt for the full text
 * of the license.
 */

/**
 * @require plugins/LayerSource.js
 * @require OpenLayers/Layer/OSM.js
 */

/** api: (define)
 *  module = gxp.plugins
 *  class = MapQuestSource
 */

/** api: (extends)
 *  plugins/LayerSource.js
 */
Ext.namespace("gxp.plugins");

/** api: constructor
 *  .. class:: MapQuestSource(config)
 *
 *    Plugin for using MapQuest layers with :class:`gxp.Viewer` instances.
 *
 *    Available layer names are "osm" and "naip"
 */
/** api: example
 *  The configuration in the ``sources`` property of the :class:`gxp.Viewer` is
 *  straightforward:
 *
 *  .. code-block:: javascript
 *
 *    "mapquest": {
 *        ptype: "gxp_mapquestsource"
 *    }
 *
 *  A typical configuration for a layer from this source (in the ``layers``
 *  array of the viewer's ``map`` config option would look like this:
 *
 *  .. code-block:: javascript
 *
 *    {
 *        source: "mapquest",
 *        name: "osm"
 *    }
 *
 */
gxp.plugins.MapQuestSource = Ext.extend(gxp.plugins.LayerSource, {
    
    /** api: ptype = gxp_mapquestsource */
    ptype: "gxp_mapquestsource",

    /** api: property[store]
     *  ``GeoExt.data.LayerStore``. Will contain records with "osm" and
     *  "naip" as name field values.
     */
    
    /** api: config[title]
     *  ``String``
     *  A descriptive title for this layer source (i18n).
     */
    title: "MapQuest Layers",

    /** api: config[osmAttribution]
     *  ``String``
     *  Attribution string for OSM generated layer (i18n).
     */
    osmAttribution: "Tiles Courtesy of <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",

    /** api: config[osmTitle]
     *  ``String``
     *  Title for OSM generated layer (i18n).
     */
    osmTitle: "MapQuest OpenStreetMap",

    /** api: config[naipAttribution]
     *  ``String``
     *  Attribution string for NAIP generated layer (i18n).
     */
    naipAttribution: "Tiles Courtesy of <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",

    /** api: config[naipTitle]
     *  ``String``
     *  Title for NAIP generated layer (i18n).
     */
    naipTitle: "MapQuest Imagery",

    /** api: method[createStore]
     *
     *  Creates a store of layer records.  Fires "ready" when store is loaded.
     */
    createStore: function() {
        
        var options = {
            projection: "EPSG:900913",
            maxExtent: new OpenLayers.Bounds(
                -128 * 156543.0339, -128 * 156543.0339,
                128 * 156543.0339, 128 * 156543.0339
            ),
            resolutions: [156543.03390625, 78271.516953125, 39135.7584765625,
                          19567.87923828125, 9783.939619140625, 4891.9698095703125,
                          2445.9849047851562, 1222.9924523925781, 611.4962261962891,
                          305.74811309814453, 152.87405654907226, 76.43702827453613,
                          38.218514137268066, 19.109257068634033, 9.554628534317017,
                          4.777314267158508, 2.388657133579254, 1.194328566789627,
                          0.5971642833948135, 0.25, 0.1, 0.05, 0.025],
            serverResolutions: [156543.03390625, 78271.516953125, 39135.7584765625,
                                19567.87923828125, 9783.939619140625,
                                4891.9698095703125, 2445.9849047851562,
                                1222.9924523925781, 611.4962261962891,
                                305.74811309814453, 152.87405654907226,
                                76.43702827453613, 38.218514137268066,
                                19.109257068634033, 9.554628534317017,
                                4.777314267158508, 2.388657133579254,
                                1.194328566789627, 0.5971642833948135, 0.298582142],
            maxResolution: 156543.03390625,
            numZoomLevels: 20,
            units: "m",
            buffer: 1,
            transitionEffect: "resize",
            tileOptions: {crossOriginKeyword: null}
        };
        
        var layers = [
            new OpenLayers.Layer.OSM(
                this.osmTitle,
                [
                    "http://otile1.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
                    "http://otile2.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
                    "http://otile3.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png",
                    "http://otile4.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.png"
                ],
                OpenLayers.Util.applyDefaults({                
                    attribution: this.osmAttribution,
                    type: "osm"
                }, options)
            ),
            new OpenLayers.Layer.OSM(
                this.naipTitle,
                [
                    "http://oatile1.mqcdn.com/naip/${z}/${x}/${y}.png",
                    "http://oatile2.mqcdn.com/naip/${z}/${x}/${y}.png",
                    "http://oatile3.mqcdn.com/naip/${z}/${x}/${y}.png",
                    "http://oatile4.mqcdn.com/naip/${z}/${x}/${y}.png"
                ],
                OpenLayers.Util.applyDefaults({
                    attribution: this.naipAttribution,
                    type: "naip"
                }, options)
            )
        ];
        
        this.store = new GeoExt.data.LayerStore({
            layers: layers,
            fields: [
                {name: "source", type: "string"},
                {name: "name", type: "string", mapping: "type"},
                {name: "abstract", type: "string", mapping: "attribution"},
                {name: "group", type: "string", defaultValue: "background"},
                {name: "fixed", type: "boolean", defaultValue: true},
                {name: "selected", type: "boolean"}
            ]
        });
        this.store.each(function(l) {
            l.set("group", "background");
        });
        this.fireEvent("ready", this);

    },
    
    /** api: method[createLayerRecord]
     *  :arg config:  ``Object``  The application config for this layer.
     *  :returns: ``GeoExt.data.LayerRecord``
     *
     *  Create a layer record given the config.
     */
    createLayerRecord: function(config) {
        var record;
        var index = this.store.findExact("name", config.name);
        if (index > -1) {

            record = this.store.getAt(index).copy(Ext.data.Record.id({}));
            var layer = record.getLayer().clone();
 
            // set layer title from config
            if (config.title) {
                /**
                 * Because the layer title data is duplicated, we have
                 * to set it in both places.  After records have been
                 * added to the store, the store handles this
                 * synchronization.
                 */
                layer.setName(config.title);
                record.set("title", config.title);
            }

            // set visibility from config
            if ("visibility" in config) {
                layer.visibility = config.visibility;
            }
            
            record.set("selected", config.selected || false);
            record.set("source", config.source);
            record.set("name", config.name);
            if ("group" in config) {
                record.set("group", config.group);
            }

            record.data.layer = layer;
            record.commit();
        }
        return record;
    }

});

Ext.preg(gxp.plugins.MapQuestSource.prototype.ptype, gxp.plugins.MapQuestSource);

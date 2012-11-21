var loadTabConfig = function(JSONconf, gCurrentLoggedRole, gLayoutsArr, addDefaultTabs, accordion) {

    // Information panel layouts for the current authorized role - we should degrade nicely if the service is not found
    _(JSONconf.liveDataEndPoints).each(function(endPoint) {
        new Ext.data.Store({
            autoLoad: true,
            proxy: new Ext.data.ScriptTagProxy({
                url: endPoint.urlLayout
            }),
            reader: new Ext.data.JsonReader(
                {
                    root: 'rows',
                    totalProperty: 'total_rows',
                    id: 'key_arr'
                },
                [ { name: 'key_arr', mapping: 'row.key_arr' } ]
            ),
            baseParams: {
                role: gCurrentLoggedRole.value,
                mode: endPoint.storeMode,
                config: endPoint.storeName
            },
            listeners: {
                load: function(store, recs) {
                    // Setting up a global variable array to define the info panel layouts
                    for (key = 0; key < recs.length; key++) {
                        var a = recs[key].json.row.val_arr;

                        if (gLayoutsArr[recs[key].json.row.key_arr]) {
                            // If this key (layer) already exists, we add the JSON element (tab) to its value (tab array)
                            gLayoutsArr[recs[key].json.row.key_arr] = gLayoutsArr[recs[key].json.row.key_arr].concat(a);
                            // Reordering the array elements inside the array for this key, according to orderNum
                            gLayoutsArr[recs[key].json.row.key_arr].sort(function(a, b) {
                                return parseInt(a.orderNum) - parseInt(b.orderNum);
                            });
                        } else {
                            // We create this key if it didn't exist
                            gLayoutsArr[recs[key].json.row.key_arr] = a;
                        }
                    }

                    addDefaultTabs(accordion, gLayoutsArr, JSONconf);
                }
            }
        });
    });

};


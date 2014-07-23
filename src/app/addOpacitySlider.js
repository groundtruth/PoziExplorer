addOpacitySlider = function(app) {

    var layerData = app.getLayersForOpacitySlider();
    var defaultLayer = app.getDefaultLayerForOpacitySlider();

    if (layerData && layerData.length) {
        var layerStore = new Ext.data.JsonStore({
            storeId: 'myLayerComboStore',
            idIndex: 0,
            fields: ['id','val','group','exclusive','visible']
        });
        layerStore.loadData(layerData.reverse());

        // Calculating the width of the drop down
        // Didn't want to do that but seems the easiest right now
        var calculatedWidth = 100, currentValWidth;
        for (j in layerData)
        {
            if (layerData[j].val)
            {
                currentValWidth = layerData[j].val.length * 8 + 30;
                if (currentValWidth > calculatedWidth)
                {
                    calculatedWidth = currentValWidth;
                }
            }
        }

        // Combo list height
        var comboItemHeight = 22;
        var nbOfItemsInList = 9;
        var comboListHeight = comboItemHeight * nbOfItemsInList;

        var firstItem;
        // If only 1 layer, use the old label display
        if (layerData.length == 1)
        {
            firstItem = new Ext.form.Label({ text: layerData[0].val, style: 'font: normal 16px verdana; color:#6E6E6E;' });
        }
        else
        {
            firstItem = new Ext.form.ComboBox({
                id:'opacitySliderCombo',
                selectOnFocus: false,
                mode: 'local',
                value: defaultLayer.id,
                allowBlank: false,
                triggerAction: 'all',
                forceSelection: true,
                maxHeight: comboListHeight,
                valueField: 'id',
                displayField: 'val',
                hideTrigger: true,
                tpl: new Ext.XTemplate('<tpl for=".">',
                        '<div class="x-combo-list-item layer-item ">',
                            '<p style="float:left;">{val}</p>',
                            '<tpl if="visible == true">',
                                '<p style="float:right;width:20px;"><img class="transparentImg2" style="width:100%;" src="theme/app/img/panel/tick.svg"/></p>',
                            '</tpl>',
                        '</div>',
                    '</tpl>'),
                itemSelector: 'div.layer-item',
                width: calculatedWidth,
                store: layerStore,
                // remove the cursor and prevents typing
                editable: false,
                listeners: {
                    'select': function(combo, record) {
                        // Modifying the layer controlled by the opacity slider
                        var os = Ext.getCmp('geoExtOpacitySlider');
                        var o = os.getValue();

                        var layerSelected = app.mapPanel.map.getLayersByName(record.get("val"))[0];
                        os.setLayer(layerSelected);

                        // Toggling the record visibility flag
                        // This will impact the styling of the tick via the combobox template
                        record.set("visible",!record.get("visible"));

                        var targetOpacity;
                        if (record.get("visible"))
                        {
                            // Managing the exclusivity of the layer just selected
                            if (record.get("exclusive"))
                            {
                                // Making all other layers in the same group invisible
                                _(JSONconf.layers).each(function(l){
                                    if (l.group == record.get("group"))
                                    {
                                        if (l.title && l.title != "No Aerial")
                                        {
                                            app.mapPanel.map.getLayersByName(l.title)[0].setVisibility(l.title == record.get("val"));
                                            combo.findRecord('val',l.title).set("visible",l.title == record.get("val"));
                                        }
                                    }
                                });
                            }

                            if (record.get("val") != "No Aerial")
                            {
                                // Set the opacity to the max if it's not set high enough to show the selected item
                                if (o <= os.minValue)
                                {
                                    targetOpacity = os.maxValue;
                                }
                                else
                                {
                                    // If in an exclusive group, we re-use a previous opacity value for this group
                                    if (record.get("exclusive"))
                                    {
                                        
                                        // Looping thru the layers of this group to check out the max opacity
                                        var commonOpacity=0.0;
                                        _(JSONconf.layers).each(function(l){
                                            if (l.group == record.get("group"))
                                            {
                                                if (l.title && l.title != "No Aerial" && l.title != record.get("val"))
                                                {
                                                    // Common opacity for this group float between 0 and 1) - requires JSON configuration to be set to 0
                                                    commonOpacity = app.mapPanel.map.getLayersByName(l.title)[0].opacity;
                                                }
                                            }
                                        });

                                        // If no opacity set on any layer in the exclusive group, set to the max
                                        if (commonOpacity == os.minValue)
                                        {
                                            commonOpacity = os.maxValue
                                        }
                                        else
                                        {
                                            // If not, we normalise the value to maxValue
                                            commonOpacity = commonOpacity * os.maxValue;
                                        }
                                        targetOpacity = commonOpacity;
                                    }
                                    else
                                    {
                                        targetOpacity = os.maxValue;
                                    }
                                }
                            }
                        }
                        else
                        {
                            targetOpacity = os.minValue;
                        }
                        // Setting the opacity on the slider
                        os.setValue(targetOpacity);

                    },
                    'expand':function(combo){
                        // Identifying the index of the currently selected item
                        var i = combo.getStore().indexOfId(combo.value);
                        if (i>= nbOfItemsInList ){i = nbOfItemsInList - 1;}
                        // Scrolling the selected item to the top of the box
                        setTimeout(function(){
                            combo.innerList.scroll('down',comboItemHeight*i);
                        }, 10);
                    },
                    scope: this
                }
            });
        }

        var allItemsToFloat = [
            firstItem,
            new Ext.Component({ html: '<p style="margin:5px 5px 5px 10px;width:20px;"><img style="width: 100%;" class="transparentImg1" src="theme/app/img/panel/map.svg"/></p>' }),
            new GeoExt.LayerOpacitySlider({ id:'geoExtOpacitySlider', layer: defaultLayer, aggressive: true, width: 100, changeVisibility: true }),
            new Ext.Component({ html: '<p style="margin:5px 5px 5px 5px;width:20px;"><img style="width: 100%;" class="transparentImg2" src="theme/app/img/panel/map.svg"/></p>' })
        ];

        // Getting the map viewport in the map element
        var elToRenderInto = Ext.get(Ext.get('mymap').select('div.olMap').elements[0].id)

        // A panel to fit all the content
        var displayPanel = new Ext.Panel({
            renderTo : elToRenderInto,
            id       : 'floatingLayerPicker',
            height   : 32,
            width    : calculatedWidth + 10 + 20 + 5 + 100 + 5 + 20 + 5 + 4,
            layout   : 'column',
            items    : allItemsToFloat
        });

        Ext.getCmp('mymap').doLayout();
    }

};


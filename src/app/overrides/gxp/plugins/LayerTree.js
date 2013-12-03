/** private: method[createOutputConfig]
 *  :returns: ``Object`` Configuration object for an Ext.tree.TreePanel
 */

// Reasons for override:
// - configuration for expanded / collapsed initial display of layer groups (controlled by layer manager's group config)
// - handling of checkbox changes to select/deselect the node with the same click

gxp.plugins.LayerTree.prototype.createOutputConfig = function() {
    var treeRoot = new Ext.tree.TreeNode({
        text: this.rootNodeText,
        expanded: true,
        isTarget: false,
        allowDrop: false
    });
    
    var defaultGroup = this.defaultGroup,
        plugin = this,
        groupConfig,
        exclusive;
    for (var group in this.groups) {
        groupConfig = typeof this.groups[group] == "string" ?
            {title: this.groups[group]} : this.groups[group];
        exclusive = groupConfig.exclusive;
        treeRoot.appendChild(new GeoExt.tree.LayerContainer(Ext.apply({
            text: groupConfig.title,
            iconCls: "gxp-folder",
            // Extracting the expanded/collapsed state from groupConfig
            expanded: ("collapsed" in groupConfig?!groupConfig.collapsed:true),
            group: group == this.defaultGroup ? undefined : group,
            loader: new GeoExt.tree.LayerLoader({
                baseAttrs: exclusive ?
                    {checkedGroup: Ext.isString(exclusive) ? exclusive : group} :
                    undefined,
                store: this.target.mapPanel.layers,
                filter: (function(group) {
                    return function(record) {
                        return (record.get("group") || defaultGroup) == group &&
                            record.getLayer().displayInLayerSwitcher == true;
                    };
                })(group),
                createNode: function(attr) {
                    plugin.configureLayerNode(this, attr);
                    return GeoExt.tree.LayerLoader.prototype.createNode.apply(this, arguments);
                }
            }),
            singleClickExpand: true,
            allowDrag: false,
            listeners: {
                append: function(tree, node) {
                    node.expand();
                }
            }
        }, groupConfig)));
    }
    
    return {
        xtype: "treepanel",
        root: treeRoot,
        rootVisible: false,
        shortTitle: this.shortTitle,
        loader: new Ext.tree.TreeLoader({ preloadChildren: true }),
        border: false,
        enableDD: true,
        selModel: new Ext.tree.DefaultSelectionModel({
            listeners: {
                beforeselect: this.handleBeforeSelect,
                scope: this
            }
        }),
        listeners: {
            contextmenu: this.handleTreeContextMenu,
            beforemovenode: this.handleBeforeMoveNode,   
            checkchange:function(n,c){
              // Managing the change: actions associated with layer being switched off
              if (c)
              {
                // Finding the configuration of the layer from the node just changed
                for (k in JSONconf.layers)
                {
                    if (JSONconf.layers.hasOwnProperty(k)){
                        // Mostly layer name is in the title, but sometimes it's in the option array (args)
                        // Hack 1: we've had to add a title to the MapQuest layer for this piece of code to work on the MapQuest layer
                        // Hack 2: we've had to re-order the basemap layers so that Vicmap basemap is at the bottom
                        var layerTitleArgs = JSONconf.layers[k].args ? JSONconf.layers[k].args[0] : "";
                        var layerTitle = JSONconf.layers[k].title ? JSONconf.layers[k].title : layerTitleArgs;
                        // Checking if there is configuration for ...
                        if (layerTitle && (layerTitle == n.layer.name))
                        {
                            // Layers to switch off ..
                            var layersToSwitchOff = JSONconf.layers[k].layersToTurnOffWhenShown;
                            for (ltc in layersToSwitchOff)
                            {
                                if (layersToSwitchOff.hasOwnProperty(ltc))
                                {
                                    app.mapPanel.map.getLayersByName(layersToSwitchOff[ltc])[0].setVisibility(false);
                                }
                            }
                            
                            // .. or layers to switch on                            
                            var layersToSwitchOn = JSONconf.layers[k].layersToTurnOnWhenShown;
                            for (ltc in layersToSwitchOn)
                            {
                                if (layersToSwitchOn.hasOwnProperty(ltc))
                                {
                                    app.mapPanel.map.getLayersByName(layersToSwitchOn[ltc])[0].setVisibility(true);
                                }
                            }
                        }                        
                    }
                }
              } 

              // If the node checkbox is clicked then we select the node
              if (c)
              {
                n.select();
              }
              else 
              // We deselect any selected nodes
              {	
                  if (this.output[0])
                  {
                      this.output[0].getSelectionModel().clearSelections();
                  }
              }
            },
            scope: this
        },
        contextMenu: new Ext.menu.Menu({
            items: []
        })
    };
};

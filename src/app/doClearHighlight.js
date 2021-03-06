// Remove the WFS highlight, clear and disable the select feature combo, empty the combostore and clean the details panel
doClearHighlight = function(app, gCombostore, addDefaultTabs, accordion, gLayoutsArr, JSONconf, northPart, collapseFlag) {
    // Removing the highlight by clearing the selected features in the WFS layer
    var selectionLayer = app.getSelectionLayer();
    if (selectionLayer)
    {
        selectionLayer.removeAllFeatures();
        selectionLayer.redraw();
    }

    // Execute all closing functions of the currently open tab if specified by the collapse flag
    if (collapseFlag)
    {
        tabCollapse();
    }
    else
    {
	// Cleaning up the screen by removing the WKT highlights from the subtabs (including the routing highlight)
	var wktLayer = app.getLayerByName("WKT");
	if (wktLayer)
	{
	    wktLayer.removeAllFeatures();
	    wktLayer.redraw();
	}
    }

    // Unselecting all vector features that were selected
    var mControls = app.mapPanel.map.controls;
    for (var a = 0; a < mControls.length; a++) {
        if (mControls[a].displayClass == "olControlSelectFeature")
        {
            mControls[a].unselectAll();
        }
    }

    // Clearing combo
    var cb = Ext.getCmp('gtInfoCombobox');
    cb.collapse();
    cb.clearValue();
    cb.disable();
    cb.removeClass("x-form-multi");
    cb.addClass("x-form-single");

    // Removing all values from the combo
    gCombostore.removeAll();

    // Add default tabs
    addDefaultTabs(accordion, gLayoutsArr, JSONconf);

    // Hiding the north part of the east panel
    northPart.setHeight(30);
    cb.setVisible(false);

    // Clearing the feature type
    Ext.get('gtInfoTypeLabel').dom.innerHTML = "&nbsp;";

};


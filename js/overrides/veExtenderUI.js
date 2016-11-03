"use strict";

/**
 * Removes some items from the original visualeditor menu
 */
function loadExtenderUI() {
    //Removes menu items that are either replaced with new ones, or not used
    var toolbarTools = $(".oo-ui-toolbar-tools"); //Store selection in local variable to improve performance
    toolbarTools.find(".oo-ui-tool-name-link").remove(); //Link
    toolbarTools.find(".ve-test-toolbar-cite").remove(); //Cite
    $(".ve-test-toolbar-insert").find(".oo-ui-tool-name-referencesList").remove(); //References list
    toolbarTools.find(".oo-ui-tool-name-meta").remove(); //Page options > Options
    toolbarTools.find(".oo-ui-tool-name-settings").remove(); //Page options > Page Settings
    toolbarTools.find(".oo-ui-tool-name-advancedSettings").remove(); //Page options > Advanced settings
    toolbarTools.find(".oo-ui-tool-name-categories").remove(); //Page options > Categories
    toolbarTools.find(".oo-ui-tool-name-languages").remove(); //Page options > Languages
    toolbarTools.find(".oo-ui-tool-name-editModeSource").remove(); //Switch to source editing
}

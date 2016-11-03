"use strict";

/**
 * This function overwrites the default Visual Extender edit behaviour.
 * The behaviour is triggered when a user presses the edit button after a transclusion has been selected.
 */
function overwriteEditBehaviour() {

    var getCommandForNodeBase = ve.ui.CommandRegistry.prototype.getCommandForNode;
    ve.ui.CommandRegistry.prototype.getCommandForNode = function(node)
    {
        if(openDialog(node))
            return "";
        else
            return getCommandForNodeBase.call(this, node);
    };

    var onEditButtonClickBase = ve.ui.LinearContextItem.prototype.onEditButtonClick;
    /**
     * Defines what should happen when clicking the edit button, returns the result of calling the original function at the end.
     * @returns {*} - The result of the original function
     */
    ve.ui.LinearContextItem.prototype.onEditButtonClick = function () {
       if(openDialog(this.model))
           return;
        else
            return onEditButtonClickBase.call(this);
    };

    function openDialog(node)
    {
        if (node.type == "mwTransclusionBlock" || node.type == "mwTransclusionInline") {
            var template = node.model.element.attributes.mw.parts[0].template;
            if (template != null) {
                if (template.params.dialog != null) {
                    if (template.params.dialog.wt == "process-linkpage-dialog") {
                        ve.ui.actionFactory.create("window", ve.init.target.getSurface()).open(template.params.dialog.wt, {
                            target: ve.init.target,
                            source: template.params.link.wt
                        });
                        return true;
                    } else {
                        ve.ui.actionFactory.create("window", ve.init.target.getSurface()).open(template.params.dialog.wt, {
                            target: ve.init.target,
                            source: template.params.resource.wt
                        });
                        return true;
                    }
                }
                switch (template.target.wt.toLowerCase()) {
                    case "external link":
                        ve.ui.actionFactory.create("window", ve.init.target.getSurface()).open("process-linkwebsite-dialog", {
                            target: ve.init.target,
                            source: template.params.resource.wt
                        });
                        return true;
                    case "internal link":
                        ve.ui.actionFactory.create("window", ve.init.target.getSurface()).open("process-linkpage-dialog", {
                            target: ve.init.target,
                            source: template.params.link.wt
                        });
                        return true;
                    case "cite":
                        if (template.params.resource.wt.indexOf("Resource Hyperlink") !== -1) {
                            ve.ui.actionFactory.create("window", ve.init.target.getSurface()).open("process-linkwebsite-dialog", {
                                target: ve.init.target,
                                source: template.params.resource.wt
                            });
                        } else {
                            ve.ui.actionFactory.create("window", ve.init.target.getSurface()).open("process-file-dialog", {
                                target: ve.init.target,
                                source: template.params.resource.wt
                            });
                        }
                        return true;
                }
            }
        }
        return false;
    }

}

"use strict";

/**
 *
 */
function overwriteEditBehaviour() {
    var onEditButtonClickBase = ve.ui.LinearContextItem.prototype.onEditButtonClick;
    ve.ui.LinearContextItem.prototype.onEditButtonClick = function () {
        if (this.model.type === "mwTransclusionBlock" || this.model.type === "mwTransclusionInline") {
            console.log("model",this.model);
            var template = this.model.element.attributes.mw.parts[0].template;
            //todo check if the properties we're looking for actually exist.
            if (template != null) {
                if (template.params.dialog != null) {
                    ve.ui.actionFactory.create('window', ve.init.target.getSurface()).open(template.params.dialog.wt, {
                        target: ve.init.target,
                        source: template.params.resource.wt
                    });
                    return;
                }
                else
                    switch (template.target.wt.toLowerCase()) {
                        case "external link":
                            ve.ui.actionFactory.create('window', ve.init.target.getSurface()).open("process-linkwebsite-dialog", {
                                target: ve.init.target,
                                source: template.params.resource.wt
                            });
                            return;
                        case "internal link":
                            ve.ui.actionFactory.create('window', ve.init.target.getSurface()).open("process-linkpage-dialog", {
                                target: ve.init.target,
                                source: template.params.link.wt
                            });
                            return;
                        case "cite":
                            if (template.params.resource.wt.indexOf("Resource Hyperlink") != -1)
                                ve.ui.actionFactory.create('window', ve.init.target.getSurface()).open("process-linkwebsite-dialog", {
                                    target: ve.init.target,
                                    source: template.params.resource.wt
                                });
                            else
                                ve.ui.actionFactory.create('window', ve.init.target.getSurface()).open("process-file-dialog", {
                                    target: ve.init.target,
                                    source: template.params.resource.wt
                                });
                            return;
                    }
            }
        }
        return onEditButtonClickBase.call(this);
    };
}
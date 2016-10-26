function overwriteEditBehaviour() {
    var onEditButtonClickBase = ve.ui.LinearContextItem.prototype.onEditButtonClick;
    ve.ui.LinearContextItem.prototype.onEditButtonClick = function () {
        var template = this.model.element.attributes.mw.parts[0].template;
        //todo check if the properties we're looking for actually exist.
        if(template != null)
        {
            if(template.params.dialog != null)
            {
                ve.ui.actionFactory.create('window', ve.init.target.getSurface()).open(template.params.dialog.wt, {target: ve.init.target, source: template.params.resource.wt});
                return;
            }
            else
                switch(template.target.wt)
                {
                    case "External Link":
                        ve.ui.actionFactory.create('window', ve.init.target.getSurface()).open("process-linkwebsite-dialog", {target: ve.init.target, source: template.params.resource.wt});
                        return;
                    case "Internal link":
                        ve.ui.actionFactory.create('window', ve.init.target.getSurface()).open("process-linkpage-dialog", {target: ve.init.target, source: template.params.resource.wt});
                        return;
                    case "Cite":
                        if(template.params.resource.indexOf("Resource Hyperlink") != -1)
                            ve.ui.actionFactory.create('window', ve.init.target.getSurface()).open("process-linkwebsite-dialog", {target: ve.init.target, source: template.params.resource.wt});
                        else
                            ve.ui.actionFactory.create('window', ve.init.target.getSurface()).open("process-file-dialog", {target: ve.init.target, source: template.params.resource.wt});
                        return;
                }
        }
        return onEditButtonClickBase.call(this);
    };
}

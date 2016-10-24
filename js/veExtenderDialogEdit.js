function overwriteEditBehaviour() {
    var onEditButtonClickBase = ve.ui.LinearContextItem.prototype.onEditButtonClick;
    ve.ui.LinearContextItem.prototype.onEditButtonClick = function () {
        var template = this.model.element.attributes.mw.parts[0].template;
        //todo check if the properties we're looking for actually exist.
        console.log("test2");
        if(template != null)
        {
            ve.ui.actionFactory.create('window', ve.init.target.getSurface()).open(template.params.optional.wt, {target: ve.init.target, source: template.params.resource.wt});
            return;
        }
        return onEditButtonClickBase.call(this);
    };
};

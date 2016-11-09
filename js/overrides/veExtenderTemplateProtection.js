/**
 * Class responsible for protecting system templates in the visual editor.
 */
var VEETemplateProtection = function () {
    //Make our list containing the templates that are to be protected.
    var protectedTemplates = {};
    //fill the list.
    evaluateTransclusions();

    /**
     * our overrides, we only preform the overrides when there are templates to be protected.
     */
    function overrides() {
        var onEditButtonClickBase = ve.ui.LinearContextItem.prototype.onEditButtonClick;
        ve.ui.LinearContextItem.prototype.onEditButtonClick = function () {
            if (this.model.type == "mwTransclusionBlock" && protectedTemplates[getTemplate(this.model)] != null) {
                mw.notify(OO.ui.deferMsg("visualeditor-emm-notification-template-edit")(), {title: OO.ui.deferMsg("visualeditor-emm-notification-template-title")()});
                return;
            }
            return onEditButtonClickBase.call(this);
        };

        //double click edit
        var getCommandForNodeBase = ve.ui.CommandRegistry.prototype.getCommandForNode;
        ve.ui.CommandRegistry.prototype.getCommandForNode = function (node) {
            if (node.type == "mwTransclusionBlock" && protectedTemplates[getTemplate(node.model)] != null) {
                mw.notify(OO.ui.deferMsg("visualeditor-emm-notification-template-edit")(), {title: OO.ui.deferMsg("visualeditor-emm-notification-template-title")()});
                return "";
            }
            return getCommandForNodeBase.call(this, node);
        };

        var copyBase = ve.ce.Surface.prototype.onCopy;
        ve.ce.Surface.prototype.onCopy = function (e) {
            var selection = this.getModel().getSelection();
            for (var i = selection.range.start; i < selection.range.end; i++) {
                var node = this.getModel().getDocument().getDocumentNode().getNodeFromOffset(i);
                if (node.type == "mwTransclusionBlock" && protectedTemplates[getTemplate(node)] != null) {
                    mw.notify(OO.ui.deferMsg("visualeditor-emm-notification-template-copy")(), {title: OO.ui.deferMsg("visualeditor-emm-notification-template-title")()});
                    return;
                }
            }
            return copyBase.call(this, e);
        };


        ve.init.target.getSurface().view.$documentNode.off("copy");

        ve.init.target.getSurface().view.$documentNode.on(
            {copy: ve.ce.Surface.prototype.onCopy.bind(ve.init.target.getSurface().view)}
        );

        ve.init.target.getSurface().view.$pasteTarget.off("copy");

        ve.init.target.getSurface().view.$pasteTarget.on(
            {copy: ve.ce.Surface.prototype.onCopy.bind(ve.init.target.getSurface().view)}
        );

        //The method responsible for deleting elements (originally located in: \mediawiki\extensions\VisualEditor\lib\ve\src\dm\ve.dm.Transaction.js).
        var base = ve.dm.Transaction.prototype.addSafeRemoveOps;

        /**
         * Recursive function that checks if a selection has a protected template, if this is the case the template should be skipped
         * and this function will be executed again with a modified offset.
         * Most parameters are identical to those of of 'addSafeRemoveOps'.
         * @param {ve.dm.Transaction} thisContext - The 'this' context from the base function.
         * @param {ve.dm.Document} doc - Document.
         * @param {number} removeStart - Offset to start removing from.
         * @param {number} removeEnd - Offset to remove to.
         * @param {boolean} removeMetadata -  Remove metadata instead of collapsing it.
         * @returns {number} - End offset of the removal.
         */
        function removeRange(doc, removeStart, removeEnd, removeMetadata, thisContext) {
            var x;
            var protect = false;
            for (x = removeStart; x < removeEnd; x++) {
                var node = doc.getDocumentNode().getNodeFromOffset(x);
                if (node.type != null)
                    if (node.type == "mwTransclusionBlock" && protectedTemplates[getTemplate(node)] != null) {
                        protect = true;
                        //removeRange(doc, x + 1, removeEnd, removeMetadata, thisContext); //fixme does not work, wrong index probably.
                        break;
                    }
            }
            var returnValue;
            if (protect) {
                ve.dm.nodeFactory.registry[doc.data.getType(x)].static.isDeletable = false;
                returnValue = base.call(thisContext, doc, removeStart, x - 1, removeMetadata);
                mw.notify(OO.ui.deferMsg("visualeditor-emm-notification-template-body")(), {title: OO.ui.deferMsg("visualeditor-emm-notification-template-title")()});
                ve.dm.nodeFactory.registry[doc.data.getType(x)].static.isDeletable = true;
            }
            else
                returnValue = base.call(thisContext, doc, removeStart, removeEnd, removeMetadata);
            return returnValue;
        }

        /**
         * Adds a replace op to remove the desired range and, where required, splices in retain ops
         * to prevent the deletion of undeletable nodes.
         * @param {ve.dm.Document} doc - Document.
         * @param {number} removeStart - Offset to start removing from.
         * @param {number} removeEnd - Offset to remove to.
         * @param {boolean} removeMetadata -  Remove metadata instead of collapsing it.
         * @return {number} - End offset of the removal.
         */
        ve.dm.Transaction.prototype.addSafeRemoveOps = function (doc, removeStart, removeEnd, removeMetadata) {
            //execute our recursive function.
            return removeRange(doc, removeStart, removeEnd, removeMetadata, this);
        };
    }


    /**
     * Retrieves all templates in the document, checks if they are system templates and if so puts them in a list.
     */
    function evaluateTransclusions() {
        //Get all nodes in the document.
        var nodes = ve.init.target.getSurface().getModel().getDocument().getDocumentNode();
        //Filter the result so we only keep the 'transclusion nodes' (templates).
        var transclusions = getTransclusions(nodes);
        //iterate over our transclusions
        for (var i = 0; i < transclusions.length; i++) {
            //retrieve the template name.
            var templateName = getTemplate(transclusions[i]);
            //execute an ask query for every template, checking the categories the template belongs to.
            new mw.Api().get({
                action: "query",
                prop: "categories",
                titles: templateName,
                formatversion: 2
            }).done(function (data) {
                var page = data.query.pages[0]; // we're only asking for a single page.
                for (var y = 0; y < page.categories.length; y++) {
                    //Does the template have the 'System' template?
                    if (page.categories[y].title.split(":").pop() == "EMont core protected") {
                        //if so, add it to our list of protected templates.
                        protectedTemplates[templateName] = true;
                    }
                }
                if (Object.keys(protectedTemplates).length > 0)
                    overrides();
            })
        }
    }


    /**
     * Retrieves transclusion nodes from a node.
     * @param {vm.dm.Node} node - Node to get the tranclusions from.
     * @returns {vm.dm.Node[]} - Array of transclusion nodes.
     */
    function getTransclusions(node) {
        var transclusions = [];
        for (var i = 0; i < node.children.length; i++)
            if (node.children[i].type == "mwTransclusionBlock")
                transclusions.push(node.children[i]);
        return transclusions;
    }

    /**
     * Retrieves the template name from a transclusion node.
     * @param {vm.dm.Node} node - Node to retrieve the template name from.
     * @returns {String} - Template name.
     */
    function getTemplate(node) {
        if (node.type == "mwTransclusionBlock") {
            for (var z = 0; z < node.element.attributes.mw.parts.length; z++) {
                if (typeof node.element.attributes.mw.parts[z] === "object")
                    return node.element.attributes.mw.parts[z].template.target.href.split("./").pop();
            }
            return null;
        }
        return node.element.attributes.mw.parts[0].template.target.href.split("./").pop();
    }


};


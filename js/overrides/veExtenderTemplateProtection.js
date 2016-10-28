/**
 * Class responsible for protecting system templates in the visual editor.
 */
var VEETemplateForclosure = function() {

    //Make our list containing the templates that are to be protected.
    var protectedTemplates = {};
    //fill the list.
    evaluateTransclusions();
    //The method responsible for deleting elements (originally located in: \mediawiki\extensions\VisualEditor\lib\ve\src\dm\ve.dm.Transaction.js).
    var base = ve.dm.Transaction.prototype.addSafeRemoveOps;
    /**
     * Adds a replace op to remove the desired range and, where required, splices in retain ops
     * to prevent the deletion of undeletable nodes.
     *
     * @param {ve.dm.Document} doc - Document.
     * @param {number} removeStart - Offset to start removing from.
     * @param {number} removeEnd - Offset to remove to.
     * @param {boolean} removeMetadata -  Remove metadata instead of collapsing it.
     * @return {number} - End offset of the removal.
     */
    ve.dm.Transaction.prototype.addSafeRemoveOps = function(doc, removeStart, removeEnd, removeMetadata)
    {
        //execute our recursive function.
        return removeRange(doc, removeStart, removeEnd, removeMetadata, this);
    };

    /**
     * Retrieves all templates in the document, checks if they are system templates and if so puts them in a list.
     */
    function evaluateTransclusions() {
        //Get all nodes in the document.
        var nodes = ve.init.target.getSurface().getModel().getDocument().getDocumentNode();
        //Filter the result so we only keep the 'transclusion nodes' (templates).
        var transclusions = getTransclusions(nodes);
        //iterate over our transclusions
        for(var i = 0; i < transclusions.length; i++)
        {
            //retrieve the template name.
            var templateName = getTemplate(transclusions[i]);
            //execute an ask query for every template, checking the categories the template belongs to.
            mw.loader.using('mediawiki.api', function () {
                    (new mw.Api()).get({
                        action: 'query',
                        prop: "categories",
                        titles: templateName,
                        formatversion: 2
                    }).done(function (data) {
                        var page = data.query.pages[0]; // we're only asking for a single page.
                        for(var y = 0; y < page.categories.length; y++) {
                            //Does the template have the 'System' template?
                            if (page.categories[y].title.split(":").pop() == "System") {
                                //if so, add it to our list of protected templates.
                                protectedTemplates[templateName] = true;
                            }
                        }
                    });
                }
            );
        }
    }

    /**
     * Recursive function that checks if a selection has a protected template, if this is the case the template should be skipped
     * and this function will be executed again with a modified offset.
     *
     * Most parameters are identical to those of of 'addSafeRemoveOps'.
     * @param {ve.dm.Transaction} thisContext - The 'this' context from the base function.
     * @returns {number} - End offset of the removal.
     */
    function removeRange(doc, removeStart, removeEnd, removeMetadata, thisContext)
    {
        var x;
        var protect = false;
        for(x = removeStart; x < removeEnd; x++){
            var node = doc.getDocumentNode().getNodeFromOffset(x);
            if(node.type != null)
                if(node.type == 'mwTransclusionBlock' && protectedTemplates[getTemplate(node)] != null)
                {
                    ve.dm.nodeFactory.registry[doc.data.getType(x)].static.isDeletable = false;
                    protect = true;
                    removeRange(doc, x + 1, removeEnd, removeMetadata, thisContext);
                    break;
                }
        }
        var returnValue;
        if(protect) {
            returnValue = base.call(thisContext, doc, removeStart, x - 1, removeMetadata);
            ve.dm.nodeFactory.registry[doc.data.getType(x)].static.isDeletable = true;
        }
        else
            returnValue = base.call(thisContext, doc, removeStart, x, removeMetadata);
        return returnValue;
    }

    /**
     * Retrieves transclusion nodes from a node.
     * @param {vm.dm.Node} node - Node to get the tranclusions from.
     * @returns {vm.dm.Node[]} - Array of transclusion nodes.
     */
    function getTransclusions(node)
    {
        var transclusions = [];
        //todo add inline transclusion grabber?
        for(var i = 0; i < node.children.length; i++)
            if(node.children[i].type == 'mwTransclusionBlock')
                transclusions.push(node.children[i]);
        return transclusions;
    }

    /**
     * Retrieves the template name from a transclusion node.
     * @param {vm.dm.Node} node - Node to retrieve the template name from.
     * @returns {String} - Template name.
     */
    function getTemplate(node)
    {
        if(node.type == 'mwTransclusionBlock') {
            for (var z = 0; node.element.attributes.mw.parts.length; z++) {
                if (typeof node.element.attributes.mw.parts[z] === "object")
                    return node.element.attributes.mw.parts[z].template.target.href.split("./").pop();
            }
            return null;
        }
        return node.element.attributes.mw.parts[0].template.target.href.split("./").pop();
    }
};


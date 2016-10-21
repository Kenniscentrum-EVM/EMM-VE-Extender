/**
 * Deze klasse wordt geinstancieerd in veExtender.js
 * @param protectedTypes array van nodetypes die niet verwijderd mogen worden, het node type is te achterhalen door de
 * console.log in dit script te uncommenten en dan in de visual editor elementen te verwijderen.
 *
 * Dit werkt nu nog niet naar behoren, nu kunnen er namelijk alleen nodetypes worden beschermt wanneer je eigenlijk binnen die types nog
 * onderscheid wil maken tussen verschillende templates. Denk aan systeem templates en reguliere templates.
 */
var VEETemplateForclosure = function() {

    evaluateTransclusions();
    var protectedTemplates = {};
    //de methode die over de verwijdering van elmenten gaat (terug te vinden in \mediawiki\extensions\VisualEditor\lib\ve\src\dm\ve.dm.Transaction.js)
    var base = ve.dm.Transaction.prototype.addSafeRemoveOps;
    ve.dm.Transaction.prototype.addSafeRemoveOps = function(doc, removeStart, removeEnd, removeMetadata)
    {
        // x is de offset van het punt in het document waar iets verwijdert moet worden.
        return removeRange(doc, removeStart, removeEnd, removeMetadata, this);
    };

    function evaluateTransclusions() {
        var nodes = ve.init.target.getSurface().getModel().getDocument().getDocumentNode();
        var transclusions = getTransclusions(nodes);
        //todo somehow check if the async operations are complete
        for(var i = 0; i < transclusions.length; i++)
        {
            var templateName = getTemplate(transclusions[i]);
            //todo this may have to be wrapped into a closure.
            mw.loader.using('mediawiki.api', function () {
                    (new mw.Api()).get({
                        action: 'query',
                        prop: "categories",
                        titles: templateName,
                        formatversion: 2
                    }).done(function (data) {
                        var page = data.query.pages[0]; // we're only asking for a single page.
                        for(var y = 0; y < page.categories.length; y++) {
                            if (page.categories[y].title.split(":").pop() == "System") {
                                protectedTemplates[templateName] = true;
                            }
                        }
                    });
                }
            );
        }
    }

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
        var returnValue; //todo range -1?
        if(protect) { //todo perhaps this isn't needed in a proper implementation
            returnValue = base.call(thisContext, doc, removeStart, x - 1, removeMetadata);
            ve.dm.nodeFactory.registry[doc.data.getType(x)].static.isDeletable = true;
        }
        else
            returnValue = base.call(thisContext, doc, removeStart, x, removeMetadata);
        return returnValue;
    }

    function getTransclusions(node)
    {
        var transclusions = [];
        //todo add inline transclusion grabber?
        for(var i = 0; i < node.children.length; i++)
            if(node.children[i].type == 'mwTransclusionBlock')
                transclusions.push(node.children[i]);
        return transclusions;
    }

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


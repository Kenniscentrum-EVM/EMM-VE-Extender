/**
 * Deze klasse wordt geinstancieerd in veExtender.js
 * @param protectedTypes array van nodetypes die niet verwijderd mogen worden, het node type is te achterhalen door de
 * console.log in dit script te uncommenten en dan in de visual editor elementen te verwijderen.
 *
 * Dit werkt nu nog niet naar behoren, nu kunnen er namelijk alleen nodetypes worden beschermt wanneer je eigenlijk binnen die types nog
 * onderscheid wil maken tussen verschillende templates. Denk aan systeem templates en reguliere templates.
 */
var VEETemplateForclosure = function(protectedTypes) {

    evaluateTransclusions();
    var deleteJobs = [];

    //de methode die over de verwijdering van elmenten gaat (terug te vinden in \mediawiki\extensions\VisualEditor\lib\ve\src\dm\ve.dm.Transaction.js)
    var base = ve.dm.Transaction.prototype.addSafeRemoveOps;
    ve.dm.Transaction.prototype.addSafeRemoveOps = function(doc, removeStart, removeEnd, removeMetadata)
    {
        var hasTemplate = false;
        var _lock = false;
        var deferred = $.Deferred();
        var _id;
        var ref = this;

        // x is de offset van het punt in het document waar iets verwijdert moet worden.
        for(x = removeStart; x < removeEnd; x++){
            //console.log("begin: " + removeStart + " | " + x + " / " + removeEnd + " | end: " + removeEnd);
            // heeft het document op deze offset een element met een type? zo ja, dan is het een node. Zo niet, dan is het gewoon tekst.
            if(doc.data.getType(x) != null) {
                // verkrijg het node object vanuit de offset.
                var node = doc.getDocumentNode().getNodeFromOffset(x);
                //console.log(node.type);
                // loop door de array met beschermde types
                    // is het type gelijk aan een type in de lijst
                console.log(node);

                    if (node.type == 'mwTransclusionInline' || node.type == 'mwTransclusionBlock') {
                        var target;
                        if(node.type == 'mwTransclusionBlock')
                        {
                            for(var z = 0; node.element.attributes.mw.parts.length; z++)
                                if(typeof node.element.attributes.mw.parts[z] === "object")
                                {
                                    //console.log(node.element.attributes.mw.parts[z]);
                                    target = node.element.attributes.mw.parts[z].template.target.href.split("./").pop();
                                    break;
                                }
                        }
                        else
                            target = node.element.attributes.mw.parts[0].template.target.href.split("./").pop();

                        hasTemplate = true;
                        _lock = true;
                        _id = window.setInterval(poll_lock, 50);

                        // maak het element niet meer deletebaar.
                        mw.loader.using('mediawiki.api', function () {
                                (new mw.Api()).get({
                                    action: 'query',
                                    prop: "categories",
                                    titles: target,
                                    formatversion: 2
                                    //titles: 'Template:Cite'
                                }).done(function (data) {
                                    console.log(data);
                                    var page = data.query.pages[0]; // we're only asking for a single page.
                                    for(var y = 0; y < page.categories.length; y++)
                                        if(page.categories[y].title.split(":").pop() == "System") {
                                            console.log("we're going to protect this template!");
                                            ve.dm.nodeFactory.registry[doc.data.getType(x)].static.isDeletable = false;
                                        }
                                    _lock = false;

                                });
                            }
                        );
                    }
            }
        }
        if(!hasTemplate)
            return base.call(this, doc, removeStart, removeEnd, removeMetadata);
        else
            return 0;

        function poll_lock()
        {
            //console.log(_lock);
            if(_lock == false)
            {
                window.clearInterval(_id);
                console.log("we're going to destroy");
                //return base.call(this, doc, removeStart, removeEnd, removeMetadata);
            }
        }

    }


    function evaluateTransclusions()
    {
        var nodes = ve.init.target.getSurface().getModel().getDocument().getDocumentNode().children;
        var transclusions = [];

        console.log(getTransclusions(nodes));

    }

    function getTransclusions(node)
    {

        //we only need the transclusionnodes, they are always at the second level
        console.log("hallo");
        var leaves = [];
        if(node.children == null)
        {
            leaves.push(node);
            return leaves;
        }
        for(var i = 0; i < node.children.length; i++)
        {
            var childLeaves = getTransclusions(node.children[i]);
            if(childLeaves.children != null)
                leaves = leaves.concat(childLeaves[i]);
            else
                leaves.push(node.children[i]);
        }
        if(!leaves.length)
            leaves.push(node);
        return leaves;
    }
};


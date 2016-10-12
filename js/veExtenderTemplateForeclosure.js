/**
 * Deze klasse wordt geinstancieerd in veExtender.js
 * @param protectedTypes array van nodetypes die niet verwijderd mogen worden, het node type is te achterhalen door de
 * console.log in dit script te uncommenten en dan in de visual editor elementen te verwijderen.
 *
 * Dit werkt nu nog niet naar behoren, nu kunnen er namelijk alleen nodetypes worden beschermt wanneer je eigenlijk binnen die types nog
 * onderscheid wil maken tussen verschillende templates. Denk aan systeem templates en reguliere templates.
 */
var VEETemplateForclosure = function(protectedTypes) {
    this.protectedTypes = protectedTypes;

    var base = ve.dm.Transaction.prototype.addSafeRemoveOps;
    ve.dm.Transaction.prototype.addSafeRemoveOps = function(doc, removeStart, removeEnd, removeMetadata)
    {
        for(x = removeStart; x < removeEnd; x++){
            if(doc.data.getType(x) != null)
            {
                var node = doc.getDocumentNode().getNodeFromOffset(x);
                console.log(node.type);
                for(var i = 0; i < protectedTypes.length; i++)
                    if(node.type == protectedTypes[i]) {
                        ve.dm.nodeFactory.registry[doc.data.getType(x)].static.isDeletable = false;
                        alert('waarschuwing, u probeert een systeemtemplate te verwijderen, dit is niet toegestaan!');
                    }
            }
        }
        //this.getDocumentNode().getNodeFromOffset( coveredOffset );
        return base.call(this, doc, removeStart, removeEnd, removeMetadata);
    }


}


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

    //de methode die over de verwijdering van elmenten gaat (terug te vinden in \mediawiki\extensions\VisualEditor\lib\ve\src\dm\ve.dm.Transaction.js)
    var base = ve.dm.Transaction.prototype.addSafeRemoveOps;
    ve.dm.Transaction.prototype.addSafeRemoveOps = function(doc, removeStart, removeEnd, removeMetadata)
    {
        // x is de offset van het punt in het document waar iets verwijdert moet worden.
        for(x = removeStart; x < removeEnd; x++){
            // heeft het document op deze offset een element met een type? zo ja, dan is het een node. Zo niet, dan is het gewoon tekst.
            if(doc.data.getType(x) != null)
            {
                // verkrijg het node object vanuit de offset.
                var node = doc.getDocumentNode().getNodeFromOffset(x)
                console.log(node.type);
                // loop door de array met beschermde types
                for(var i = 0; i < protectedTypes.length; i++)
                    // is het type gelijk aan een type in de lijst
                    if(node.type == protectedTypes[i]) {
                        // maak het element niet meer deletebaar.
                        ve.dm.nodeFactory.registry[doc.data.getType(x)].static.isDeletable = false;
                        // tijdelijke feedback.
                        alert('waarschuwing, u probeert een systeemtemplate te verwijderen, dit is niet toegestaan!');
                    }
            }
        }
        //this.getDocumentNode().getNodeFromOffset( coveredOffset );
        return base.call(this, doc, removeStart, removeEnd, removeMetadata);
    }


}


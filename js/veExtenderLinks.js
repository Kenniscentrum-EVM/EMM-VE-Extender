"use strict";

String.prototype.replaceAll = function (search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
function isString (obj) {
    return (Object.prototype.toString.call(obj) === '[object String]');
}
function SPARQLStore() {
    this.datastore="portfolios";
    this.sparqlActive=true;
    this.getsuperresult=null;
    this.getsemanticresult=null;
    var self=this;

    this.uristart=window.location.href.split("/index.php/")[0];
    this.prefix="PREFIX wiki: <#uristart#/index.php/Speciaal:URIResolver/>"+
        "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>"+
            "PREFIX address:<http://195.93.238.56/wiki/portfoliotest/wiki/index.php/>"+
        "PREFIX skos: <http://www.w3.org/2004/02/skos/core#>"+
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>"+
        "PREFIX owl: <http://www.w3.org/2002/07/owl#>"+
        "PREFIX swivt: <http://semantic-mediawiki.org/swivt/1.0#>"+
        "PREFIX category: <#uristart#/index.php/Speciaal:URIResolver/Category-3A>"+
        "PREFIX property: <#uristart#/index.php/Speciaal:URIResolver/Property-3A>"+
        "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>";

    this.standardLine="  ?Self rdfs:label ?Pagename. "+
        " optional {?Self property:Semantic_title ?Semantic_title.}";
    /**
     * exectue sparql-query on Sparql-store
     * @param sparqlquery has to contain ?Self as output
     * @param callQuery
     * @param getSemanticPrintouts
     */
    this.callSparqlPrintout = function (sparqlquery, callQuery,setvar,printoutsDefault) {
        sparqlquery=
            this.prefix+sparqlquery;
        //console.log("query:" + this.uristart+" ; "+sparqlquery);
        sparqlquery=sparqlquery.replaceAll("#uristart#",this.uristart);
        console.log("query:" + sparqlquery);
        var proxy = location.href.substring(0, window.location.href.lastIndexOf("/")) + '/Special:MyProxy';//Special Page Proxy
        //add query to address
        var url = proxy + '?' + "query=" + encodeURIComponent(sparqlquery) + "&dataset="+this.datastore;
        //console.log("url:" + url);
        $.get(url, function (json){
            var table = json.results.bindings;
            console.log(table);
            var results={};
            for (var i =0;i<table.length;i++) {
                var line = table[i];
                var id = decodeURIComponent(self.pageName(line.Pagename.value.replaceAll("-3A", ":").replaceAll("__", ":").replaceAll("_", " ").replace("-27", "'")));//self.pageName(line.Self.value).replaceAll("_"," ").replace("-3A",":");

                //do a clone of object
                var printouts1 = JSON.parse( JSON.stringify( printoutsDefault ) );

                //console.log("line1:",line);
                for (var oldid in line){
                    var newid=oldid;

                    newid=newid.replaceAll("__",":").replaceAll("_"," ");
                    var value2 = line[oldid].value.replace("-3A",":").replace("%3B",";");


                    if (oldid=="Hyperlink"){
                        printouts1[newid]=[decodeURI(value2)];
                    } else
                    if (oldid=="Supercontext"){
                        printouts1[newid]=[{fulltext:self.pageName(decodeURI(value2)).replaceAll("_"," ")}];
                    } else
                    if (line[oldid]["type"]=="uri"){
                        printouts1[newid]=[{fulltext:self.pageName(value2), fullurl:value2}];
                    } else
                    if (line[oldid]["type"]=="typed-literal"){
                        if (line[oldid]["datatype"]=="http://www.w3.org/2001/XMLSchema#gYear"){
                            value2=value2+"/01/01";
                            var timestamp=parseInt((new Date(value2).getTime() / 1000).toFixed(0));
                            printouts1[newid]=[{raw:"1/"+value2,timestamp:timestamp.toString()}];
                        } else
                        if (line[oldid]["datatype"]=="http://www.w3.org/2001/XMLSchema#date"){
                            value2=value2.replaceAll("-","/").replace("Z","");
                            if (value2.length<5)value2=value2+"/01/01";
                            var id3=parseInt((new Date(value2).getTime() / 1000).toFixed(0));
                            printouts1[newid]=[{raw:"1/"+value2,timestamp:id3.toString()}];
                        } else
                        printouts1[newid]=[cNum((value2))];
                    } else
                    if (line[oldid]["type"]=="literal"){
                        printouts1[newid]=[self.pageName(value2)];
                    }
                    /*if (newid=="Semantic title"&&!(isString(printouts1[newid][0]))){
                        printouts1[newid][0] ="";
                        console.log("change type of Semantic title!");
                    }*/
                }
                var myid=id;
                try{
                    //check if there is a previous printout
                    var previousprintouts=results[myid].printouts;
                    for (var key in previousprintouts){
                        var equal=false;
                        try{
                            for (var k=0;k<previousprintouts[key].length;k++){
                                if (previousprintouts[key][0].fulltext==printouts1[key][k].fulltext)
                                    equal=true;
                            }

                        }catch(e){
                            equal=true;
                        }
                        //use original array to add elements with multi-values
                        if (!equal)
                            results[myid].printouts[key].push(printouts1[key][0])

                    }
                    //previousprintouts["Dct:subject"].push(printouts1["Dct:subject"][0])
                    console.log("oldid-equal:",printouts1);
                } catch(e) {
                    //if not, create new element in results

                    results[myid] = {
                        printouts: printouts1,
                        fulltext: id
                    };
                }
            }
            var queryresults={query:{results:results}};
            console.log(queryresults);
            setvar(queryresults);

            if (sparqlStore.sparqlActive)
                callQuery(queryresults)

        });
    };

    this.getResources=function(callQuery){

        //resources that have a filename
        var sparqlquery=
            "SELECT ?Self  ?Semantic_title ?File_name ?Pagename WHERE {"+
            "?Self  rdf:type category:Resource_Description."+
            this.standardLine+
            " ?Self property:File_name ?File_name."+
            "} order by ?Semantic_title";

        this.callSparqlPrintout(sparqlquery, callQuery,function(queryresults){},
            {"Semantic title":[""],"Organization":[""],"Dct:date":[{raw:"1/1970/01/01",timestamp:"0"}],
                "Dct:creator":[""],"Dct:subject":[""],"Self":[{fullurl:"",fulltext:""}]});
    };
    //[[Category:Light Context||Project||Projecten]]|?Semantic title|?Category=Category|?Supercontext|sort=Semantic title
    this.getLinkPages=function(callQuery){
        /*
        dit kan volgens mij met de query (2X):
         SELECT ?Self  ?Semantic_title ?Category ?Supercontext ?Pagename WHERE {
         {?Self  rdf:type category:Light_Context. BIND (category:Light_Context AS ?Category).} union {?Self  rdf:type category:Project. BIND (category:Project AS ?Category). } union {?Self  rdf:type category:Projecten.    BIND (category:Projecten AS ?Category). }

         optional { ?Self property:Supercontext ?Supercontext1.
         ?Supercontext1 property:Semantic_title ?Semantic_title2. bind(if (!bound(?Semantic_title2),"unknown semantic title",?Semantic_title2) as ?Supercontext2)}
         optional {?Self property:Semantic_title ?Semantic_title.}
         optional {?Self wiki:Property-3APagename ?Pagename. }
         bind (if (bound(?Supercontext2),?Supercontext2,if (bound(?Supercontext1),?Supercontext1,"no super")) as ?Supercontext)
         } order by ?Semantic_title

         }
         */
        var sparqlquery=
            "SELECT ?Self  ?Semantic_title ?Category ?Supercontext ?Pagename WHERE {"+
            "{?Self  rdf:type category:Light_Context. BIND (category:Light_Context AS ?Category).} union {?Self  rdf:type category:Project. BIND (category:Project AS ?Category). } union {?Self  rdf:type category:Projecten.    BIND (category:Projecten AS ?Category). }"+
            "optional { ?Self property:Supercontext ?Supercontext1."+
            "?Supercontext1 property:Semantic_title ?Semantic_title2. bind(if (!bound(?Semantic_title2),\"unknown semantic title\",?Semantic_title2) as ?Supercontext2)}"+
            this.standardLine+
            "bind (if (bound(?Supercontext2),?Supercontext2,if (bound(?Supercontext1),?Supercontext1,\"no super\")) as ?Supercontext)"+
            "} order by ?Semantic_title ";

        this.callSparqlPrintout(sparqlquery, callQuery,function(queryresults){},{"Semantic title":[""],"Organization":[""],"Dct:date":[{raw:"1/1970/01/01",timestamp:"0"}],
            "Dct:creator":[""],"Dct:subject":[""],"Self":[{fullurl:"",fulltext:""}],"Supercontext":[{fulltext:""}]});
    };
    this.getEditData=function(page,callQuery){
        console.log("page:",page);
        this.getLightContextProperties(page.replaceAll("_"," "),callQuery);
    };
    this.getLightContextProperties=function(page,callQuery){
        //page=encodeURIComponent(page.replaceAll(" ","_")).replaceAll("%","-");
        var sparqlquery=
            ("SELECT ?Self  ?Dct__creator ?Dct__subject ?Dct__date ?Organization ?Semantic_title ?Hyperlink ?File_name ?Supercontext  ?Pagename WHERE "+
            "{?Self rdfs:label \""+page.replaceAll("_"," ")+"\". "+
            "optional {?Self property:Dct-3Acreator ?Dct__creator.  } optional {"+
            "?Self  property:Dct-3Asubject ?Dct__subject.  } optional {"+
            "?Self  property:Dct-3Adate ?Dct__date.  } optional {"+
            "?Self  property:Dct-3Adate ?Dct__date.  }"+
            this.standardLine+
            " optional {?Self  property:Hyperlink ?Hyperlink.  } optional {"+
            "?Self  property:Supercontext ?Supercontext.  } optional {"+
            "?Self  property:File_name ?File_name.  } optional {"+
            "?Self  property:Organization ?Organization.}}");//"File_name"

        this.callSparqlPrintout(sparqlquery, callQuery,function(queryresults){},
            {"File name":[""],"Hyperlink":[""],"Semantic title":[""],"Organization":[""],"Dct:date":[{raw:"1/1970/01/01",timestamp:"0"}],
                "Dct:creator":[""],"Dct:subject":[{fullurl:"",fulltext:""}],"Self":[{fullurl:"",fulltext:""}],"Supercontext":[{fulltext:""}]});
    };
    //[[Category:Resource Description]] [[Hyperlink::+]]|?Semantic title|?Hyperlink|?Dct:creator|?Dct:date|?Organization|?Dct:subject|sort=Semantic title|order=asc|limit=10000
    this.getHyperLinkPages=function(callQuery){
        //rezources that have a Hyperlink
        var sparqlquery=
            "SELECT ?Self  ?Semantic_title ?Dct__creator ?Dct__subject ?Dct__date ?Hyperlink ?Organization ?Pagename WHERE {"+
            "?Self  rdf:type category:Resource_Description."+
            this.standardLine+
            "?Self property:Hyperlink ?Hyperlink."+
            "} order by ?Semantic_title";

        this.callSparqlPrintout(sparqlquery, callQuery,function(queryresults){},
            {"Semantic title":[""],"Hyperlink":[""],"Organization":[""],"Dct:date":[{raw:"1/1970/01/01",timestamp:"0"}],
                "Dct:creator":[""],"Dct:subject":[""],"Self":[{fullurl:"",fulltext:""}]});
    };
    //query: [[Category:Resource Description]]|?Semantic title|?Dct:creator|?Dct:date|?Organization|?Dct:subject|?file name|?Hyperlink|sort=Semantic title|order=asc|limit=10000
    this.getReferencePages=function(callQuery){
        //resources that have no filename, and no hyperlink
        var sparqlquery=
            "SELECT ?Self  ?Semantic_title ?Dct__creator ?Dct__subject ?Dct__date ?Hyperlink ?File_name ?Organization ?Pagename WHERE {"+
            "?Self  rdf:type category:Resource_Description."+
            this.standardLine+
                " FILTER (NOT EXISTS {?Self property:File_name ?File_name.} && NOT EXISTS {?Self property:Hyperlink ?Hyperlink.}) "+
            "}";

        this.callSparqlPrintout(sparqlquery, callQuery,function(queryresults){},
            {"Semantic title":[""],"Hyperlink":[""],"File name":[""],"Organization":[""],"Dct:date":[{raw:"1/1970/01/01",timestamp:"0"}],
                "Dct:creator":[""],"Dct:subject":[""],"Self":[{fullurl:"",fulltext:""}]});
    };
    /**
     * gets the id of the sparql-url. That is the last part of the uri
     * @param id
     * @returns {string}
     */
    this.pageName=function(id) {
        id = id.split("/");
        id = id[id.length - 1];
        return id.replaceAll("-2D","-").replaceAll("_"," ");
    };
    /**
     * get semantic title for context
     * @param topContext
     * @param callQuery
     */
    this.getSemanticTitle=function(topContext,callQuery){
        if (sparqlStore.getsemanticresult!=null){
            callQuery(sparqlStore.getsemanticresult)
            return;
        }
        var s="wiki:"+topContext.replaceAll(" ","_");
        var sparqlquery=
            "SELECT ?Semantic_title ?Self WHERE {"+
            s+" property:Semantic_title ?Semantic_title."+
            s+" property:Self ?Self."+//add self
            "}";

        this.callSparqlPrintout(sparqlquery, callQuery,function(queryresults){sparqlStore.getsemanticresult=queryresults},{});
    };

    //[[Category:Light Context||Project]]
    this.getProjects=function(callQuery) {
        //De sparql-query om dit uit te voeren is dan:
        var sparqlquery =
            "SELECT ?Semantic_title ?Self WHERE {{" +
            "?Self rdf:type category:Light_Context." +
            "?Self property:Semantic_title ?Semantic_title." +
            "} union {" +
            "?Self rdf:type category:Project." +
            "?Self property:Semantic_title ?Semantic_title." +
            "}}";

        this.callSparqlPrintout(sparqlquery, callQuery,function(queryresults){},{});
    };

    /**
     * get supercontext for all Light Context's under top-context
     * @param topContext
     * @param callQuery
     */
    this.getSuper=function(topContext,callQuery) {
        if (sparqlStore.getsuperresult!=null){
            callQuery(sparqlStore.getsuperresult);
            return;
        }

        //De sparql-query om dit uit te voeren is dan:
        var sparqlquery =
            "SELECT ?Semantic_title ?Sequence_number ?Toppage ?Self ?Supercontext WHERE {" +
            "?s rdf:type category:Light_Context." +
            "?s property:Topcontext wiki:" + /*PR_SSM_00050."*/topContext.replaceAll(" ", "_") + "." +
            "?s property:Semantic_title ?Semantic_title." +
            " OPTIONAL { ?s property:Sequence_number ?Sequence_number.} " +
            "?s property:Supercontext ?Supercontext." +
            "?s property:Toppage ?Toppage." +
            "?s property:Self ?Self." +
            "} order by ?Semantic_title";

        this.callSparqlPrintout(sparqlquery, callQuery,function(queryresults){sparqlStore.getsuperresult=queryresults;},{});
        //this.getProjects(function(data){console.log("data:",data);});
    };
}
var sparqlStore = new SPARQLStore();

/**
 * This method is executed when the extension is loaded and is responsible for passing the correct information to the loadEMMDialog method
 * At the moment it calls loadEMMDialog to create three dialogs and menu items: File, Internal link and External link
 */
function addEMMLinks() {
    //Create a File-dialog and add a menu item for the dialog
    loadEMMDialog("File", "file", OO.ui.deferMsg("visualeditor-emm-menufiletitle")(), OO.ui.deferMsg("visualeditor-emm-dialogfiletitle")(),
        function (nameData, linkData) {
            return {
                resource: {
                    wt: linkData
                },
                name: {
                    wt: nameData
                },
                dialog: {
                    wt: "process-file-dialog"
                }
            };
        }
    );
    //Create an internal-link-dialog and add a menu item for the dialog
    loadEMMDialog("Internal link", "linkpage", OO.ui.deferMsg("visualeditor-emm-menuinternallinktitle")(), OO.ui.deferMsg("visualeditor-emm-dialoginternallinktitle")(),
        function (nameData, linkData) {
            return {
                link: {
                    wt: linkData
                },
                name: {
                    wt: nameData
                },
                dialog: {
                    wt: "process-linkpage-dialog"
                }
            };
        }
    );
    //Create an external-link-dialog and add a menu item for the dialog
    loadEMMDialog("External link", "linkwebsite", OO.ui.deferMsg("visualeditor-emm-menuexternallinktitle")(), OO.ui.deferMsg("visualeditor-emm-dialogexternallinktitle")(),
        function (nameData, linkData) {
            return {
                resource: {
                    wt: linkData
                },
                name: {
                    wt: nameData
                },
                dialog: {
                    wt: "process-linkwebsite-dialog"
                }
            };
        }
    );

    //Create a bibliographic reference dialog and add a menu item for the dialog
    loadEMMDialog("Bibliographic reference", "bibliographicreference", OO.ui.deferMsg("visualeditor-emm-menubibliographicreferencetitle")(), OO.ui.deferMsg("visualeditor-emm-dialogbibliographicreferencetitle")(),
        function (nameData, linkData) {
            return {
                resource: {
                    wt: linkData
                },
                name: {
                    wt: nameData
                },
                dialog: {
                    wt: "process-bibliographicreference-dialog"
                }
            };
        }
    );
}

/**
 * This function creates a dialog of the specified type, it also adds a menu button to the insert-menu in order to access the dialog
 * Currently available dialog types are: Internal link, External link and File
 * @param {string} resourceType - The name of the resource type for which we want to create a dialog and menu-items
 * @param {string} toolId - The internal name for the tool/button in the menu-bar
 * @param {string} menuText - The text that should be displayed in the menu-bar
 * @param {string} dialogText - The text that should be displayed at the top of the dialog
 * @param {function} templateResult - A function that transforms the inserted data into the required format for inserting the links as a template
 */
function loadEMMDialog(resourceType, toolId, menuText, dialogText, templateResult) {
    var dialogName = "process-" + toolId + "-dialog";

    // create the dialog of the given type
    createDialog(dialogName, dialogText, resourceType, templateResult);

    // Add a menu-item that opens the dialog
    var tool = function (config) {
        ve.ui.Tool.call(this, config);
        this.setDisabled(false);
        this.$element.addClass("oo-ui-tool-name-extratemplate");
    };

    //More configuration for the menu-item
    OO.inheritClass(tool, ve.ui.Tool);
    tool.static.name = toolId;
    tool.static.title = menuText;
    tool.static.group = "tools";
    tool.static.icon = "link";
    tool.static.allowCollapse = null;
    tool.static.dialog = dialogName;
    tool.static.deactivateOnSelect = true;
    tool.prototype.onSelect = function () {
        //Target: ve.init.target is passed in order to enable closing the dialog with the escape key.
        ve.ui.actionFactory.create("window", this.toolbar.getSurface()).open(dialogName, {target: ve.init.target});
        this.setActive(false);
    };
    ve.ui.toolFactory.register(tool);
}

/**
 * This method creates a dialog that helps the user with inserting a specific type of link
 * @param {string} dialogName - The internal name of the dialog
 * @param {string} dialogMessage - The text that will be displayed at the top of the dialog
 * @param {string} resourceType - For what type of resource the dialog should be created, currently available types: File, Internal link, External link
 * @param {function} templateResult - A function that transforms the inserted data into the required format for inserting the links as a template
 */
function createDialog(dialogName, dialogMessage, resourceType, templateResult) {
    /**
     * Constructor for EMMDialog, all relevant fields are initiated, mostly with default null or 0 values.
     * @extends OO.ui.ProcessDialog
     * @constructor
     */
    var EMMDialog = function () {
        OO.ui.ProcessDialog.call(this);
        this.suggestion = null;
        this.isExistingResource = false;
        /**
         * Enum for dialog modes
         * @readonly
         * @enum {number}
         */
        this.modeEnum = {
            INSERT_EXISTING: 0,
            INSERT_NEW: 1,
            EDIT_EXISTING: 2,
            INSERT_AND_EDIT_EXISTING: 3
        };
        this.dialogMode = this.modeEnum.INSERT_EXISTING;
        this.suggestionCache = null;
        this.selectedTextObject = null;
        //Create some common fields, present in all dialogs
        this.presentationTitleField = new OO.ui.TextInputWidget();
        this.titleField = new OO.ui.TextInputWidget();
        //Create an empty fieldset, which is responsible for the layout of the dialog
        this.fieldset = new OO.ui.FieldsetLayout({
            classes: ["container"]
        });
        /*Create all the fields for te dialog. This method should be overwritten so all the fields required for a specific
         type of dialog are created.*/
        this.createFields();
        //Add the fields created above to a fieldsetlayout that makes sure the fields and labels are in the correct place.
        this.createDialogLayout();
        //add validation for the form
        var dialogInstance = this;
        this.validator = new Validator(
            this,
            null,
            function (object, message) {
                object.$element.addClass("oo-ui-flaggedElement-invalid");
                var el = $("<p>" + message + "</p>").css({
                    "margin": "0px 0px 0px",
                    "color": "red",
                    "position": "absolute"
                });
                object.$element.after(el);
                dialogInstance.actions.forEach({actions: "insert"}, function (action) {
                    action.setDisabled(true);
                });
            },
            function () {
                dialogInstance.actions.forEach({actions: "insert"}, function (action) {
                    action.setDisabled(false);
                });
            },
            null,
            function (object) {
                object.$element.removeClass("oo-ui-flaggedElement-invalid");
                object.$element.parent().find("p").remove();
            }
        );
    };
    //Define EMMDialog as a subclass of OO.ui.ProcessDialog
    OO.inheritClass(EMMDialog, OO.ui.ProcessDialog);

    //Set static properties of the dialogDi
    EMMDialog.static.name = dialogName;
    EMMDialog.static.title = dialogMessage;
    //Define what actions the dialog should have, these are represented as buttons on the top-side of the dialog.
    EMMDialog.static.actions = [
        {
            action: "insert",
            label: OO.ui.deferMsg("visualeditor-emm-insert"),
            flags: ["primary", "constructive"],
            disabled: true
        },
        {action: "cancel", label: OO.ui.deferMsg("visualeditor-emm-cancel"), flags: "safe"}
    ];

    /**
     * Behaviour for the function createDialogLayout which is present in all dialogs.
     * Initiates validation for the common fields present in all dialogs.
     * Needs to be expanded on for behavior for specific dialogs.
     */
    EMMDialog.prototype.createDialogLayout = function () {
        this.titleField.validation = [checkIfEmpty];
        this.presentationTitleField.validation = [checkIfEmpty];
    };

    /**
     * Returns the query that is used to gather information for all existing resources of a certain type.
     * Depends on what kind of resource this is.
     * @return {string|string|string} - An ask-query that gathers information for all existing resource of a given type.
     */
    EMMDialog.prototype.getAutocompleteQuery = function () {
        return this.autoCompleteQuery;
    };

    /**
     * Returns the query that is used to gather the information about a single resource.
     * @param {string} internalPageName - The internal name of the page where a certain resource is described.
     * @return {string} - An ask-query that gathers information about a single existing resource with a given pageName
     */
    EMMDialog.prototype.getEditQuery = function (internalPageName) {
        return this.editQuery.replace(/PAGENAMEPARAMETER/g, internalPageName);
    };

    /**
     * Checks if the current contents of the dialog match the last picked suggestion. If they don't the user is editing
     * the resource.
     * @returns {boolean} - Whether the user is editing the selected resource
     */
    EMMDialog.prototype.isEdit = function () {
        return this.titleField.getValue() != this.suggestion.value;
    };

    /**
     * Get the 'ready' process.
     * The ready process is used to ready a window for use in a particular context, based on the data argument. This method is called during the
     * opening phase of the windows lifecycle, after the window has been setup.
     *
     * We override this method to add additional steps to the 'ready' process, currently we check if the 'data' parameter contains a source property.
     * This source property contains a string which is a reference to a page. If the 'data' parameter contains a source property that means that we are trying to edit
     * an existing link, in which case we will ask the api for information about the referenced page and fill our dialog with the result.
     * We also add a step to the process where the currently selected text in the page the user is editing is inserted
     * into the presentationtitlefield.
     * @param {Object} data - Window opening data.
     * @returns {OO.ui.Process} - The process that should be executed when the dialog is ready
     */
    EMMDialog.prototype.getReadyProcess = function (data) {
        var dialogInstance = this;

        /**
         * Checks if the user is trying to edit an existing link to a resource. If this is the case, information about
         * the resource is gathered and an edit dialog is opened with the fields already filled in.
         */
        function openEditDialog() {
            //When being queued by the first method of OO.ui.process the scope of 'this' is set.
            var data = this;
            if (data.source != null) //are we editing?
            {
                var resultFunction=function (queryData) {
                    dialogInstance.validator.disable(); //completely disable validation before we're going to fill the dialog.
                    dialogInstance.validator.disableOnChange();
                    var res = queryData.query.results;
                    for (var row in res) {
                        if (!res.hasOwnProperty(row)) { //seems to be required.
                            continue;
                        }
                        var suggestion = dialogInstance.processSingleQueryResult(row, res);
                        if (suggestion == null) {
                            mw.notify(OO.ui.deferMsg("visualeditor-emm-notification-err-invalidlink-body")(), {
                                title: OO.ui.deferMsg("visualeditor-emm-notification-err-invalidlink-title")(),
                                autoHide: false,
                                type: "error"
                            });
                            dialogInstance.close();
                            return;
                        }

                        dialogInstance.suggestion = suggestion;
                        dialogInstance.titleField.setValue(suggestion.value);
                        setDisabledInputFields(dialogInstance.fieldset, false);
                        dialogInstance.fillFields(); //fill our dialog.
                        dialogInstance.isExistingResource = true;
                    }
                    dialogInstance.validator.enable(); //enable validation again.
                    dialogInstance.validator.validateAll();
                    dialogInstance.validator.enableOnChange();
                }
                dialogInstance.executeModeChange(dialogInstance.modeEnum.EDIT_EXISTING, false);
                setDisabledInputFields(dialogInstance.fieldset, true);
                data.source = data.source.replace(/ /g, "_"); //convert whitespaces to underscores
                var api = new mw.Api();
                var query = dialogInstance.getEditQuery(data.source); //getEditQuery retrieves the correct query for us.
                //console.log("execute query in EMMDialog.prototype.getReadyProcess: ",query);
                if (sparqlStore.sparqlActive){
                    sparqlStore.getEditData(data.source,resultFunction)
                } else
                    api.get({
                        action: "ask",
                        query: query
                    }).done(resultFunction);
            }
        }

        /**
         * Inserts the text that was selected before the dialog was opened into the presentationtitlefield
         */
        function grabAndValidateText() {
            dialogInstance.selectedTextObject = grabSelectedText(dialogInstance.presentationTitleField);
            if (dialogInstance.presentationTitleField.value.length > 0) {
                dialogInstance.validator.validateWidget(dialogInstance.presentationTitleField);
            }
        }

        //Add the two functions above to the queue of processes that will be executed when a dialog is opened
        return EMMDialog.super.prototype.getReadyProcess.call(this, data).first(openEditDialog, data).next(grabAndValidateText);
    };

    /**
     * Checks what should happen after a user has pressed the insert button. Depending on what the user was trying to do
     * we either need to call a query, or simply only link to the selected resource.
     * @param {function} insertCallback - The callback function that creates a link on the wiki page to the selected or
     * created resource. Will be executed directly, or after the query has finished processing if a query was executed.
     * @param {String} currentPageID - The ID of the page that is currently being edited, can only contain alphanumeric
     * characters and whitespace
     * @param {String} linkData - In case of an existing resource, linkData contains the internal name of the resource
     * in order to let the api know what existing resource should be edited. Otherwise linkData is just an empty string.
     */
    EMMDialog.prototype.executeInsertAction = function (insertCallback, currentPageID, linkData) {
        //IsEdit can only be executed for an existing resource. Because of lazy evaluation the second part of the
        //OR-statement will only be evaluated once the first part is true. That's why this doesn't crash.
        if (!this.isExistingResource || this.isEdit()) {
            this.buildAndExecuteQuery(currentPageID, insertCallback, linkData);
        } else {
            //If we're not editing an existing resource or creating a new one, we just insert a link inside the page.
            insertCallback(this.suggestion.data);
        }
    };

    /**
     * Displays an error message for when a specific overloaded function isn't present
     * @param {String} functionName - The name of the function that has no overloaded equivalent
     */
    function displayOverloadError(functionName) {
        throw new Error(OO.ui.deferMsg("visualeditor-emm-overloaded-function-error")() + functionName);
    }

    /*Define basic versions of functions that need to be overloaded.
     These functions display an error message to indicate that a dialog-specific overloaded function is missing.
     These functions are an attempt to emulate the idea of an abstract method as seen in other Object Oriented languages*/

    /**
     * Abstract method that needs to be overridden, displays an error message if this is not the case.
     * Expected behavior when overriding:
     * Creates all the inputfields of a dialog that are not yet created in the constructor of the general EMMDialog.
     * @abstract
     */
    EMMDialog.prototype.createFields = function () {
        displayOverloadError("createFields");
    };

    /**
     * @abstract
     * Abstract method that needs to be overridden, displays an error message if this is not the case.
     * Expected behavior when overriding:
     * Preforms the a mode change, this may include visual changes to a dialog.
     * @param {number} mode - Mode to be switched to.
     * @param {boolean} clearInputFieldsBool - If true the input fields of the dialog will be cleared.
     */
    EMMDialog.prototype.executeModeChange = function (mode, clearInputFieldsBool) {
        displayOverloadError("executeModeChange");
    };

    /**
     * Abstract method that needs to be overridden, displays an error message if this is not the case.
     * Expected behavior when overriding:
     * Checks the status of the dialog and changes the dialogmode if necessary.
     * @abstract
     */
    EMMDialog.prototype.testAndChangeDialogMode = function () {
        displayOverloadError("testAndChangeDialogMode");
    };

    /**
     * Abstract method that needs to be overridden, displays an error message if this is not the case.
     * Expected behavior and parameters when overriding:
     * Builds and executes a query that creates a new resource or edits an existing one with the sfautoedit api-calll.
     * After the new resource has been added, a link is then inserted into the page by executing insertCallback.
     * @param {String} currentPageID - The ID of the page that is currently being edited, can only contain alphanumeric
     * characters and whitespace
     * @param {function} insertCallback - The function that should be executed after a new resource has been added or
     * an existing one was changed. This function handles inserting a link into the current page.
     * @param {String} linkData - In case of an existing resource, linkData contains the internal name of the resource
     * in order to let the api know what existing resource should be edited. Otherwise linkData is just an empty string.
     * @abstract
     */
    EMMDialog.prototype.buildAndExecuteQuery = function (currentPageID, insertCallback, linkData) {
        displayOverloadError("buildAndExecuteQuery");
    };

    /**
     * Abstract method that needs to be overridden, displays an error message if this is not the case.
     * Expected behavior and parameters when overriding:
     * Executes a query by using the mediawiki api. This query either creates a new resource or updates an existing one
     * @abstract
     * @param {String} query - The query that should be executed. The query should be suitable for an sfautoedit api call.
     * @param {function} insertCallback - A function that handles inserting a link to the newly created or edited resource
     * into the current page. This is executed after the api has finished processing the request.
     * @param {String} linkData - The internal title of a resource. Should be set to the internal title of the resource
     * you want to edit, or be empty when creating a new resource.
     */
    EMMDialog.prototype.executeQuery = function (query, insertCallback, linkData) {
        displayOverloadError("executeQuery");
    };

    /**
     * Abstract method that needs to be overridden, displays an error message if this is not the case.
     * Expected behavior and parameters when overriding:
     * Fill the fields of the dialog based on a resource the user has selected from the autocomplete dropdown.
     * @abstract
     */
    EMMDialog.prototype.fillFields = function () {
        displayOverloadError("fillFields");
    };

    /**
     * Abstract method that needs to be overridden, displays an error message if this is not the case.
     * Expected behavior and parameters when overriding:
     * Depending on the type of resource and choices made by the user in the dialog, links to different types of resources
     * are created in the current page with different types of templates. This function returns what template type to use.
     * @abstract
     * @returns {String} - Null in the abstract case, but should be a String containing the type of template to use.
     */
    EMMDialog.prototype.findTemplateToUse = function () {
        displayOverloadError("findTemplateToUse");
        return null;
    };

    /**
     * Retrieves the auto complete state for a given dialog mode.
     * @abstract
     * @param {modeEnum} mode - dialog mode to get the auto complete state for.
     * @returns {boolean} - The value the auto complete should be set to.
     */
    EMMDialog.prototype.getAutoCompleteStateForMode = function (mode) {
        displayOverloadError("findTemplateToUse");
    };

    var dialog = null;
    switch (resourceType) {
        case "File":
        case "External link":
            dialog = createLightResourceDialog(EMMDialog, resourceType);
            break;
        case "Internal link":
            dialog = createInternalLinkDialog(EMMDialog);
            break;
        case "Bibliographic reference":
            dialog = createLightResourceDialog(EMMDialog, resourceType);
            break;
        default:
            mw.notify(OO.ui.deferMsg("visualeditor-emm-dialog-error")(), {
                autoHide: false,
                type: "error"
            });
    }
    ve.ui.windowFactory.register(dialog);


    /**
     * Initializes the dialog.
     * Creates all visual items inside the dialog and adds the necessary logic to it
     */
    EMMDialog.prototype.initialize = function () {
        /*Put the dialog in a variable for easier use
         This is also necessary because in certain cases the meaning of the this keyword changes, even though you want
         to be able to keep accessing the dialogInstance*/
        var dialogInstance = this;

        //Add a label that displays the meaning of the * next to form values
        var requiredLabel = new OO.ui.LabelWidget({
            label: OO.ui.deferMsg("visualeditor-emm-required")
        });
        dialogInstance.fieldset.addItems([new OO.ui.FieldLayout(requiredLabel)]);

        //Add the created fieldset to the dialog
        EMMDialog.super.prototype.initialize.call(this);
        this.content = new OO.ui.PanelLayout({
            padded: true,
            expanded: false
        });
        this.content.$element.append(dialogInstance.fieldset.$element);
        this.$element
            .addClass("oo-ui-windowManager")
            .toggleClass("oo-ui-windowManager-modal", true);
        this.$body.append(this.content.$element);

        /**
         * Define what should happen when the insert button is clicked.
         */
        var insertButtonHandler = function () {
            setDisabledDialogElements(dialogInstance, true);
            var nameData = dialogInstance.presentationTitleField.getValue();
            if (dialogInstance.suggestion != null) {
                var linkData = dialogInstance.suggestion.data.length > 0 ? dialogInstance.suggestion.data : "";
            }
            else {
                linkData = "";
            }

            /**
             * Callback function to be called after creating a new resource or editing an existing one
             * It is responsible for inserting a template in the text of your page that links to the resource
             * @param linkTitle The internal name of the resource that should be linked to
             */
            var insertCallback = function (linkTitle) {
                var templateToUse = dialogInstance.findTemplateToUse();
                var myTemplate = [
                    {
                        type: "mwTransclusionInline",
                        attributes: {
                            mw: {
                                parts: [
                                    {
                                        template: {
                                            target: {
                                                href: "Template:" + templateToUse,
                                                wt: templateToUse
                                            },
                                            params: templateResult(nameData, linkTitle)
                                        }
                                    }
                                ]
                            }
                        }
                    }
                ];

                dialogInstance.semanticAskQuery(dialogInstance.getAutocompleteQuery(),
                    function () {
                        setAutoCompleteEnabled(dialogInstance, false);
                        setAutoCompleteEnabled(dialogInstance, dialogInstance.getAutoCompleteStateForMode(dialogInstance.dialogMode));
                    });
                var surfaceModel = ve.init.target.getSurface().getModel();
                var transaction = ve.dm.Transaction.newFromReplacement(surfaceModel.getDocument(), dialogInstance.selectedTextObject, myTemplate);
                var newRange = transaction.getModifiedRange(surfaceModel.getDocument());
                surfaceModel.change(transaction, newRange ? new ve.dm.LinearSelection(surfaceModel.getDocument(), newRange) : new ve.dm.NullSelection(surfaceModel.getDocument()));
                surfaceModel.setNullSelection();
                dialogInstance.close();
                setDisabledDialogElements(dialogInstance, false);
            };

            //Get the name of the current page and replace any underscores with whitespaces to prevent errors later on.
            var currentPageID = mw.config.get("wgPageName").replace(/_/g, " ");
            //Check some variables and decide what has to be done
            dialogInstance.executeInsertAction(insertCallback, currentPageID, linkData);
        };

        /**
         * Define what should happen when the cancel button is clicked.
         */
        var cancelButtonHandler = function () {
            //Close the dialoginstance
            dialogInstance.close();
        };

        /**
         * Link event handling functions to the buttons of the dialog
         * @param {String} action - The symbolic name of the action for which we need a process
         * @returns {OO.ui.Process} - Returns the parent function in case an action that isn't related to an EMMDialog happens
         */
        EMMDialog.prototype.getActionProcess = function (action) {
            if (action === "insert") {
                return new OO.ui.Process(function () {
                    insertButtonHandler();
                });
            }
            else if (action === "cancel") {
                return new OO.ui.Process(function () {
                    cancelButtonHandler();
                });
            }
            //Needed to enable proper dialog-closing behavior when closing a dialog by pressing the escape-button.
            else {
                dialogInstance.close();
            }
            //Use parent handler in case something goes wrong
            return EMMDialog.super.prototype.getActionProcess.call(this, action);
        };

        /**
         * A function that should be called after the askQuery is done gathering all available resources of a specified type
         * This function initiates the autocomplete library for the resource input field
         * The user will be able to pick a resource from the list of all resources gathered by the askQuery
         */
        var autoCompleteCallback = function (queryResults) {
            setAutoCompleteEnabled(dialogInstance, dialogInstance.getAutoCompleteStateForMode(dialogInstance.dialogMode));
        };

        //Execute the askQuery in order to gather all resources
        dialogInstance.semanticAskQuery(dialogInstance.getAutocompleteQuery(), autoCompleteCallback);

        /**
         * The size of the dialog is set up and some more layout settings are configured here.
         * @param {Object} dim - An object containing css properties for the dimensions of the dialog
         */
        EMMDialog.prototype.setDimensions = function (dim) {
            dialogInstance.fieldset.$element.css({width: dim.width - 10});
            this.$frame.css({
                width: dim.width + 250 || "",
                height: this.getContentHeight() + 30 || ""
            });
            dialogInstance.fieldset.$element.css("width", "100%");
            for (var i = 0; i < dialogInstance.fieldset.getItems().length; i++) {
                dialogInstance.fieldset.getItems()[i].$element.find(".oo-ui-fieldLayout-body > .oo-ui-labelElement-label").not(".oo-ui-selectFileWidget-label").css("margin-right", 0).css("float", "left").css("width", "30%");
                dialogInstance.fieldset.getItems()[i].$element.find(".oo-ui-fieldLayout-field").css("width", "70%");
                dialogInstance.fieldset.getItems()[i].$element.find(".oo-ui-fieldLayout-body").css("width", "100%");
            }
        };

        /**
         * Method that we override in order to expand the behaviour of a dialog when it is closing. We add a step to the
         * process that will be executed when a dialog closes.
         * @returns {OO.ui.Process} - The process that will be executed when the dialog closes.
         */
        EMMDialog.prototype.getTeardownProcess = function () {
            /**
             * Clears all the input fields and resets other variables to their default state.
             */
            function cleanUpDialog() {
                hideAutoComplete(dialogInstance.titleField.$element.find("input"));
                dialogInstance.validator.disable();
                dialogInstance.validator.disableOnChange();
                clearInputFields(dialogInstance.fieldset, null);
                dialogInstance.dialogMode = dialogInstance.modeEnum.INSERT_EXISTING;
                dialogInstance.executeModeChange(dialogInstance.modeEnum.INSERT_EXISTING, false);
                dialogInstance.validator.enableOnChange();
                dialogInstance.validator.enable();
                dialogInstance.isExistingResource = false;
                dialogInstance.suggestion = null;
            }

            //Execute the original getTeardownProcess, but add our cleanup function to the process that is executed on closing.
            return EMMDialog.super.prototype.getTeardownProcess.call(this).next(cleanUpDialog)
        }
    };

    /**
     * Processes a single query result into a suggestion object.
     * @param {String} row - String index of a row in the resultSet associative array.
     * @param {Object[]} resultSet - Associative array which functions like a dictionary, using strings as indexes, contains the result of a query.
     * @param {Object} previousSuggestion - A suggestion object that contains the information about the previous processed suggestion, useful for comparing and sorting.
     * @returns {Object} suggestionObject - A suggestion object, containing relevant information about a particular page which can be used by various functions fillFields.
     */
    EMMDialog.prototype.processSingleQueryResult = function (row, resultSet, previousSuggestion) {
        var suggestionObject = {};
        suggestionObject.data = resultSet[row].fulltext;
        suggestionObject.value = "";
        try {
            if (sparqlStore.sparqlActive) {
                var self = resultSet[row].printouts["Self"][0].fulltext.replace("-3A", ":").replace("-27", "'");
                try {
                    self = decodeURIComponent(resultSet[row].printouts["Pagename"][0]);
                } catch (e) {
                    console.log("No Pagename property, using Self");
                }
                suggestionObject.self = self;
            }
        } catch(e){}

        var semanticTitle = resultSet[row].printouts["Semantic title"][0];
        if (semanticTitle) {
            suggestionObject.value = semanticTitle;
        } else {
            suggestionObject.value = suggestionObject.data;
        }
        suggestionObject.semanticTitle = suggestionObject.value;
        return suggestionObject;
    };

    /**  semanticAskQuery
     *  This method is responsible for executing a call to the mediawiki API of the type "ask"
     *  @param query {String} the query that is to be used in the API-call
     *  @param callback {function} a function that will be executed after the api-call is finished
     */
    EMMDialog.prototype.semanticAskQuery = function (query, callback) {
        var dialogInstance = this;
        var api = new mw.Api();
        console.log("query:",query);
        var processQueryResults=function (data) {
            var res = data.query.results;
            console.log("results:",data);
            var arr = []; //array to store the results
            var previousSuggestion = null;
            var row;
            for (row in res) {
                if (!res.hasOwnProperty(row)) {
                    continue;
                }
                var singleQueryResult = dialogInstance.processSingleQueryResult(row, res, previousSuggestion);
                if (previousSuggestion != null)
                    arr.push(previousSuggestion);
                previousSuggestion = singleQueryResult;
            }
            //Add the final row.
            if (previousSuggestion != null) {
                arr.push(dialogInstance.processSingleQueryResult(row, res, previousSuggestion));
            }
            //todo investigate ASK query possibilities and restrictions, this may possibly be unnecessary.
            arr.sort(function (a, b) {
                try {
                    if (a.value.toUpperCase() > b.value.toUpperCase()) {
                        return 1;
                    }
                    if (a.value.toUpperCase() < b.value.toUpperCase()) {
                        return -1;
                    }
                } catch(e) {
                    return -1;
                }

                return 0;
            });
            dialogInstance.suggestionCache = arr;
            callback();
        };
        if (sparqlStore.sparqlActive){
            this.processSparql(processQueryResults);
        } else
        api.get({
            action: "ask",
            parameters: "limit:10000",
            query: query
        }).done(processQueryResults);
    };
}

/**
 * Enables or disables an entire fieldSet depending on the given boolean value.
 * @param {OO.ui.FieldsetLayout} fieldSet - FieldSet to disable or enable.
 * @param {boolean} value - Boolean instruction, true = disable, false = enable.
 */
function setDisabledInputFields(fieldSet, value) {
    for (var i = 0; i < fieldSet.getItems().length; i++) {
        fieldSet.getItems()[i].getField().setDisabled(value);
    }
}

/**
 * Enables or disables all clickable items of a dialog. Also adds or removes a progress bar.
 * @param {OO.ui.EMMDialog} dialogInstance - FieldSet to disable or enable.
 * @param {boolean} value - Boolean instruction, true = disable, false = enable.
 */
function setDisabledDialogElements(dialogInstance, value) {
    setDisabledInputFields(dialogInstance.fieldset, value);
    dialogInstance.actions.forEach(null, function (action) {
        action.setDisabled(value);
    });
    if (value) {
        var progressBar = new OO.ui.ProgressBarWidget({
            progress: false
        });
        var progressbarFieldLayout = new OO.ui.FieldLayout(progressBar);
        dialogInstance.fieldset.addItems([progressbarFieldLayout]);
        progressbarFieldLayout.$element.find(".oo-ui-fieldLayout-field").css("width", "100%");
        progressbarFieldLayout.$element.find(".oo-ui-fieldLayout-body").css("width", "100%");
        progressbarFieldLayout.$element.find(".oo-ui-progressBarWidget").css("max-width", "100%");
        progressbarFieldLayout.$element.find(".oo-ui-progressBarWidget-bar").css("background-color", "#347bff");
    }
    else {
        dialogInstance.fieldset.removeItems([dialogInstance.fieldset.getItems()[dialogInstance.fieldset.getItems().length - 1]]);
    }
}

/**
 * Clears the input fields of a given fieldset
 * @param {OO.ui.FieldsetLayout} fieldset - The fieldset whose input fields should be emptied
 * @param {int[]} excludeNum - The indices of the fields in the fieldset that should not be cleared
 */
function clearInputFields(fieldset, excludeNum) {
    main:
        for (var i = 0; i < fieldset.getItems().length; i++) {
            if (excludeNum != null && excludeNum.length != 0) {
                for (var x = 0; x < excludeNum.length; x++) { //todo dynamically resize this array?
                    if (excludeNum[x] == i) {
                        excludeNum.splice(x, 1);
                        continue main;
                    }
                }
            }
            //Apparently we also go trough some LabelWidgets in this loop, these things will break IE9 and IE10 .setValue(x) is called on them.
            if (fieldset.getItems()[i].getField() instanceof OO.ui.SelectFileWidget) {
                fieldset.getItems()[i].getField().setValue(null);
            } else if (fieldset.getItems()[i].getField() instanceof OO.ui.CheckboxInputWidget) {
                fieldset.getItems()[i].getField().setSelected(true);
            } else if (fieldset.getItems()[i].getField().supports("setValue")) {
                fieldset.getItems()[i].getField().setValue("");
            } else if (fieldset.getItems()[i].getField().supports("getMenu")) {
                fieldset.getItems()[i].getField().getMenu().selectItemByData("Article");
            }
        }
}

/**
 * Creates a new resource or edits an existing one, depending on whether target is empty or not.
 * @param {String} query - The query that should be executed for the given target.
 * @param {function} callback - The callback function that will be executed after creating or updating a resource.
 * @param {String} target - The internal title of the target of the query when editing an existing resource,
 * or empty when creating a new resource.
 * @param {String} form - The name of the semantic form that should be used to create or update the resource.
 */
function semanticCreateWithFormQuery(query, callback, target, form) {
    var api = new mw.Api();
    api.get({
        action: "sfautoedit",
        form: form,
        query: query,
        target: target
    }).done(function (data) {
        callback(data.target);
    });
}

/**
 * Grabs the text that is selected (outside the dialog) and inserts it into the presentationtitle field inside the dialog
 * @param {OO.ui.TextInputWidget} inputObject - The field in which the selected text should be inserted
 * @returns {Object} - Returns a range object
 */
function grabSelectedText(inputObject) {
    var surfaceModel = ve.init.target.getSurface().getModel();
    var whiteSpaces = 0;
    var string = "";
    if (surfaceModel.getFragment().selection.range) {
        for (var i = surfaceModel.getFragment().selection.range.start; i < surfaceModel.getFragment().selection.range.end; i++) {
            var node = ve.init.target.getSurface().getModel().getDocument().getDocumentNode().getNodeFromOffset(i);
            if (node.getType() == "mwTransclusionInline") {
                string += node.element.attributes.mw.parts[0].template.params.name.wt;
                continue;
            }
            var element = surfaceModel.getFragment().document.data.data[i];
            if (typeof element[0] === "undefined")
                continue;
            var toAdd = element;
            if (element[0])
                toAdd = element[0];
            string += toAdd;
        }
        if (string.length > 0)
            while (string.charAt(string.length - 1) == " ") {
                string = string.substring(0, string.length - 1);
                whiteSpaces++;
            }
        var range = surfaceModel.getFragment().selection.range;
        inputObject.setValue(string);
        return new ve.Range(range.start, range.end - whiteSpaces);
    }
    else
        return new ve.Range(0, 0);
}

/**
 * Initializes the autocomplete library
 * @param {Object[]} data - A collection of all the items that can be searched through
 * @param {EMMDialog} dialogInstance - The dialog for which the autocomplete dropdown should be activated
 */
function initAutoComplete(data, dialogInstance) {
    var inputField = $(dialogInstance.titleField.$element).find("input");
    $(inputField).autocomplete({
        lookup: data,
        triggerSelectOnValidInput: false,
        onSelect: function (suggestion) {
            dialogInstance.suggestion = suggestion;
            dialogInstance.isExistingResource = true;
            dialogInstance.titleField.setValue(suggestion.semanticTitle);
            inputField.blur();
            dialogInstance.fillFields(suggestion);
            dialogInstance.testAndChangeDialogMode();
        },
        appendTo: inputField.parentElement,
        maxHeight: 300
    });
}

/**
 * Hides the autocomplete suggestion box.
 * @param {$} element - JQuery element that has autocomplete functionality.
 */
function hideAutoComplete(element) {
    if (element.autocomplete() != null)
        element.autocomplete().hide();
}

/**
 * Enables or disables the autocomplete functionality of a given element depending on the given value.
 * @param {EMMDialog} dialogInstance - Jquery element containing autoComplete functionality.
 * @param {Boolean} value - Boolean value that decides the state of the autoComplete. true = enabled, false = disabled.
 */
function setAutoCompleteEnabled(dialogInstance, value) {
    var element = dialogInstance.titleField.$element.find("input");
    if (value && element.autocomplete() == null && dialogInstance.suggestionCache != null) {
        initAutoComplete(dialogInstance.suggestionCache, dialogInstance);
    }
    else if (!value && element.autocomplete() != null) {
        hideAutoComplete(element);
        element.autocomplete().dispose();
    }
}

/**
 * The datepicker requires a yyyy/mm/dd value when it's being set remotely. This function transforms an object with a
 * timestamp into a Date object of the required format.
 * @param {Object} date - An object that contains a timestamp field, which contains a timestamp representation of a date
 * @returns {String} - A string containing the date in the US format: "yyyy-mm-dd"
 */
function fixDate(date) {
    if (date == null) {
        return "";
    }
    var d = new Date(date.timestamp * 1000);
    var mm = ("0" + (d.getMonth() + 1)).slice(-2);
    var dd = ("0" + d.getDate()).slice(-2);
    var yyyy = d.getFullYear();
    return yyyy + "-" + mm + "-" + dd; //(US)
}
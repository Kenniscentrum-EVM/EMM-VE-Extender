"use strict";

/**
 * addEMMLinks
 * adds menu-itmes, each one starts a dialog
 * 
 */
function addEMMLinks() {

    var queries=veExtenderQueries();
   //console.log(queries);
  loadEMMDialog('Internal link',"linkpage",'visualeditor-emm-menuinternallinktitle','visualeditor-emm-dialoginternallinktitle','visualeditor-emm-link-to-page',
    queries.linkpages,function(namedata,linkdata){
        return {
                      link: { wt: linkdata },
                      name: { wt: namedata }
                    };
    }, [],
    120
  );
  loadEMMDialog('External link',"linkwebsite",'visualeditor-emm-menuexternallinktitle','visualeditor-emm-dialogexternallinktitle','visualeditor-emm-link-to-resource',
    queries.linkwebsites,function(namedata,linkdata){return {
                      resource: { wt: linkdata },
                      name: { wt: namedata }
                    };
    }, [],
    120
  );
  loadEMMDialog('Cite',"linkreference",'visualeditor-emm-menucitetitle','visualeditor-emm-dialogcitetitle','visualeditor-emm-link-to-resource',
    queries.linkreferences,function(namedata,linkdata, data){
//                                        console.log(data);
                    var optionaldata=data.optional.wt;
                    return {
                      resource: { wt: linkdata },
                      name: { wt: namedata },
                      optional: {wt: optionaldata}
                    };
    }, [{label:"optional",defaultval:"",type:"text",description:OO.ui.deferMsg( 'visualeditor-mwtemplate-cite-optional' )}],
		160
  );

//ve.ui.toolFactory.bindings.register[6].context.forceExpand= [ 'media', 'insertTable' ,'linkpage' ,'linkwebsite' ,'linkreference'];

}
/**
 * loadEMMDialog
 * load dialog
 * @param  {String} template template to be generated
 * @param  {[String]}toolid unique String to be used as id,also base for id´s of fields
 * @param  {[String]} menutext language-text to be displayed as part of menu
 * @param  {[String]} dialogtext language-text to be displayed at top of dialog
 * @param  {[String]} linktotext language-text to be displayed as link
 * @param  {[String]} askQuery definition of ask-query to be executed as part of resourceControl
 * @param  {[function]} templateResult defines what to return as result of template; input parameters: namedata, linkdata, data
 * @return {[Array]} myFields array of fields to be added to dialog
 */
  function loadEMMDialog(template, toolid,menutext,dialogtext,linktotext,askQuery,templateResult,myfields,heightForm){
 //at start of dialog
//get pagenames for pages with askQuery, with Semantic title as a property
//
"use strict";
var pagenames = [];





    var makeInsertTool = function(buttonMessage, dialogueMessage, collection, element, templateName, nameLabel, resourceLabel,
                  copySelectedTextToNameField
                 , myfields, heightForm) {
    var dialogueName = collection + " dialogue",//collection=id to make dialog unique
        toolName = collection + " tool";

    /*
     Make the dialogue.
     */
    var dialogue = function(surface, config) {
        OO.ui.ProcessDialog.call(this, surface, config);
    };

    OO.inheritClass(dialogue, OO.ui.ProcessDialog);

    dialogue.static.name = dialogueName;
    dialogue.static.title = dialogueMessage;
    dialogue.static.actions = [
        { action: 'save', label: OO.ui.deferMsg( 'visualeditor-dialog-action-insert')(), flags: [ 'primary', 'progressive' ] },
        { action: 'cancel', label: OO.ui.deferMsg( 'visualeditor-dialog-action-cancel' )(), flags: 'safe' }
    ];


    dialogue.prototype.getActionProcess = function ( action ) {
        var that = this;


        switch (action) {
        case "cancel":
        return new OO.ui.Process(function() {
            that.close({
            action: action
            });
        });

        case "save":
        return new OO.ui.Process(function() {
            that.insert();
        });

        default:
        return dialogue.super.prototype.getActionProcess.call(this, action);
        }
    };

    //within getBodyHeight
    //get selected text, and set default text of first field to that selected text
    //do this within getBodyHeight because it is executed before the dialog becomes visible
    dialogue.prototype.getBodyHeight = function () {

      //first get data for input-fields. Get query-data, and add selected data
      //save instance
      var dialogthat=this;

      var api = new mw.Api();
      // Start a "GET" request
      api.get( {
          action: 'ask',
          parameters:'limit:10000',//check how to increase limit of ask-result; done in LocalSettings.php
          //query was: [[Modification date::+]]|?Modification date|?Heading nl
          //test-query:[[Category:Context]]|?Modification date|?Heading nl
          query: askQuery+'|?Semantic title|limit=10000'//get all pages; include property Semantic title
      } ).done( function ( data ) {
        //parse data
        //first get results within data
          var res=data.query.results;
          //console.log(res);

          //array to store results
          var arr=[];
          //for all objects in result

	  var prevTitle="";
	  var numTitle=0;
	  for (prop in res) {
	      if (!res.hasOwnProperty(prop)) {
		  //The current property is not a direct property of p
		  continue;
	      }
	      //property defined
	      //now get pagename and Semantic title (if available)
	      var pagename=res[prop].fulltext;
	      var semantictitle=res[prop].printouts['Semantic title'][0];
	      var title='';
	      if (semantictitle)
		title=semantictitle;
	      else
		title=pagename;
	      if (title==prevTitle){
		numTitle++;
		title=title+"("+pagename+")";
	      }
	      else
	      {
		prevTitle=title;
		numTitle=0;
	      }
		//console.log(title);
	      arr.push({ value: title, data: pagename });
	  }
	  arr.sort(function(a, b) {
	      if (a.value > b.value) {
		return 1;
	      }
	      if (a.value < b.value) {
		return -1;
	      }
	      // a must be equal to b
	      return 0;
	    });
	  var prevTitle="";
	  for (var i=0;i<arr.length;i++){
	    var item=arr[i];
	    var title=item.value;
	      if (title==prevTitle){
		arr[i].value=title+"("+pagename+")";
	      }
	      else
	      {
		prevTitle=title;
	      }
	  }
          pagenames=arr;
        //store data in inputfields
        copySelectedTextToNameField(dialogthat);
      });

      //return height of dialog; this is original purpose of this function
        return heightForm;
    };

    dialogue.prototype.initialize = function() {
        var instance = this,
        currentSelection,
        /*
         When we're finished with our dialogue, Insert a template in the page.
         */
        insert = function() {
          //check if data is filled in for nameControl
            var data={};
            var i;
            for (i=0;i<instance.fields.length;i+=1){
              data[instance.fields[i].text]={ wt: instance.fields[i].control.getValue()};
            }
            var linkdata=this.pageid.length>0?this.pageid:"";
            var namedata=nameControl.getValue();
            if (linkdata.length==0 ){
              alert(OO.ui.deferMsg( 'visualeditor-emm-select-existing-item' )()+'!');
              return;
            }


            var mytemplate=  [
                {
                  type: 'mwTransclusionInline',
                  attributes: {
                    mw: {
                      parts: [
                        { template: {
                            target: {
                              href: 'Template:'+templateName,
                              wt: templateName
                            },
                            params: templateResult(namedata,linkdata,data)
                            }
                        }
                      ]
                    }
                  }
                }
              ]
            ;


            //insert result in text
             var surfaceModel = ve.init.target.getSurface().getModel();
             var range=surfaceModel.getFragment().selection.range;
             var rangeToRemove = new ve.Range( range.start, range.end );

            var fragment = surfaceModel.getLinearFragment( rangeToRemove );
            fragment.insertContent( mytemplate );
            //empty elements so they can be reused later on
            nameControl.setValue("");//resourceControl
            resourceControl.setValue("");

            instance.close();
        },

        nameControl = new OO.ui.InputWidget({
            value: ""
        }),
        name = new OO.ui.FieldLayout(
            nameControl,
            {
            label: nameLabel//todo :make it: Tekst in pagina
            }
        ),

        resourceControl = new OO.ui.TextInputWidget({
            placeholder: OO.ui.deferMsg( 'visualeditor-emm-search' )(),
            value: ""
        }),
        resource = new OO.ui.FieldLayout(
            resourceControl,
            {
            label: resourceLabel//todo: make it: link naar pagina
            }
        ),

        //add functions to parse and add fieds at end of dialog
        getElements=function (fields){
          //for each field in parametr, create an element in the dialogue
          var arr=[];
          var i;
          for (i=0;i<fields.length;i+=1){
            arr.push(fields[i].label.$element);
          }
          return arr;
        },
        getFields=function (label,defaultval,type,description){
          //assign an input-widget to each field
          var control = new OO.ui.InputWidget({
                    value: defaultval
                });
          control.$input.attr("type", type);
          control.$input.css("width", "100%");
          return {
            control:control,
            label : new OO.ui.FieldLayout(
            control,
            {
                label: description
            }
            ),
            text:label
          };
        },
        /**
         * @param  {Array} myFields objects to represent a field to be displayed
         * @return {[Array]} fields converted to array
         */
        loadFields=function (myfields){
          var arr=[];
          var i;
          for (i=0;i<myfields.length;i+=1){
           arr.push(getFields(myfields[i].label,myfields[i].defaultval,myfields[i].type,myfields[i].description));
          }
          //console.log(getElements(arr));
          return arr;
        },
        fields=loadFields(myfields),//calls previous function. COuld be combined in an anonymous function
        form = new OO.ui.FieldsetLayout({
            $content: [
            name.$element,
            resource.$element
            ].concat(getElements(fields))//add extra fields at end of dialog
        }),

        panel = new OO.ui.PanelLayout({
            padded: true
        }),

        stack = new OO.ui.StackLayout({
            continuous: true,
            scrollable: false,
            items: [
            panel
            ]
        });

        //add DOM-id to parent of input-field
        resourceControl.$element.attr("id",toolid+"id");
        //add DOM-id to parent of name-field
        name.$element.attr("id",toolid+"nameid");
        OO.ui.ProcessDialog.prototype.initialize.call(this);

        this.nameControl=nameControl;

        this.content = stack;
        this.insert = insert;
        this.fields=fields;
        this.$body.append(this.content.$element);

        panel.$element.append(form.$element);

        nameControl.$input.attr("type", "text");

        resourceControl.$input.attr("type", "text");

        //nameControl.$input.css("width", "130px");
        resourceControl.$input.css("width", "100%");

        $(":text").css({ 'width':'300px'}); //TODO schalen naar breedte dialoog (?), voor nu even hard-coded
	//outline elements of Form
	$(".oo-ui-fieldLayout-body>.oo-ui-labelElement-label").css( {'width': '130px'});//TODO: workaround; see how this can be fixed in css of Chameleon Skin
    };

    ve.ui.windowFactory.register(dialogue);

    /*
     create a menu-entry in the current dropdown-menu of the main toolbar
     */
    var tool = function(toolGroup, config) {
        ve.ui.Tool.call(this, toolGroup, config);
            this.setDisabled( false );
        this.allowCollapse=null;
        this.$element.addClass( 'oo-ui-tool-name-extratemplate' );
    };

    OO.inheritClass(tool, ve.ui.Tool);
    tool.static.name = toolid;
    tool.static.title = buttonMessage;
    tool.static.group = 'tools';
    tool.static.icon = 'link';
    tool.static.allowCollapse=null;
    tool.static.dialog = dialogueName;
    //TODO unselect item if action done, following does not work....
    tool.static.deactivateOnSelect = true;
    tool.prototype.onSelect = function () {
        this.toolbar.getSurface().execute('window', 'open', dialogueName, null);
        this.setActive( false );
    };

    ve.ui.toolFactory.register(tool);

    };


/**
 * @param  {object} that object that contains field that will contain the text to be displayed
 * @return {[type]}
 */
    var copySelectedTextToNameField=function(that){
      //get selected text from SurfaceModel
      var surfaceModel = ve.init.target.getSurface().getModel();
      var selected="";
      //console.log(surfaceModel);
      if (surfaceModel.getFragment().selection.range){
        var i;
    //console.log(surfaceModel.getFragment().selection.range);
        for (i=surfaceModel.getFragment().selection.range.start;i<surfaceModel.getFragment().selection.range.end;i++){
          var element=surfaceModel.getFragment().document.data.data[i];
          var toAdd=element;
          if (element[0]){//if element[0], then not plain text
            toAdd=element[0];//
          }
          //console.log(toAdd);
          selected+=toAdd;
        }
      }
      //set text to selected
      if (selected.length>0){
        that.nameControl.setValue(selected);
        that.nameControl.disabled=true;//does not work!?
        var inputfieldoutside=$( "#"+toolid+"nameid" ).find("input");;
        $(inputfieldoutside).val(selected);
      }

      var complete=$( "#"+toolid+"id" ).find("input");
      //console.log(complete);
      that.pageid="";
      //set autocomplete on resource-field
      $(complete).autocomplete({
          lookup: pagenames,//pagenames are created at the start of dialog
          onSelect: function (suggestion) {
            that.pageid=suggestion.data;
          },
          appendTo: complete.parentElement,
	  maxHeight: 300
        });
    }

    makeInsertTool(
        OO.ui.deferMsg( menutext )(),//title in menu
        OO.ui.deferMsg( dialogtext )(),//Title on top of dialog
        "process-" + toolid,
        "process-model",
        template,//id of template to be generated
        OO.ui.deferMsg( 'visualeditor-emm-text-in-page' )(),//nameLabel
        OO.ui.deferMsg( linktotext )(),//resourceLabel
        copySelectedTextToNameField,
        myfields,heightForm
    );//todo: make extra basic dialog, add function with makeInsertTool to execute it, instead of that.insert();--> button text must bee continue instead of save.

}
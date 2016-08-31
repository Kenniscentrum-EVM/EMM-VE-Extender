mw.loader.load( 'oojs' );
mw.loader.load( 'oojs-ui' );
/* Any JavaScript here will be loaded for all users on every page load. */
mw.loader.using( ['oojs-ui'] ).done( function () {
  var dialogthat;

// Create form  elements (text input, checkbox, submit button, etc.)
var input1 = new OO.ui.TextInputWidget( { 
  placeholder: 'A form text field'
} );

var input2 = new OO.ui.TextInputWidget( { 
  placeholder: 'A form text field'
} );

var input3 = new OO.ui.TextInputWidget( { 
  placeholder: 'A form text field with help'
} );

var input4 = new OO.ui.CheckboxInputWidget( {
  selected: true
} );


      

var selectFile = new OO.ui.SelectFileWidget({ showDropTarget: true });
selectFile.onFileSelected=function(e) {
console.log(e);
	var file = OO.getProp( e.target, 'files', 0 ) || null;

	if ( file && !this.isAllowedType( file.type ) ) {
		file = null;
	}

	this.setValue( file );
	this.addInput();
}


selectFile.onDrop=function(e) {
alert(":drop" );
console.log(selectFile);
console.log(e);

}

selectFile.connect(selectFile,{
  change:'onDrop',//emit-event, see code
  fileSelected:'onFileSelected'
}
)      
// Create a Fieldset layout.
var fieldset = new OO.ui.FieldsetLayout( { 
  label: 'FieldsetLayout: Examples of label alignment and help text',
  classes: ["container"]
} );

// Add field layouts that contain the form elements to the fieldset. Items can also be specified 
// with the FieldsetLayout's 'items' config option: 

fieldset.addItems( [ 
  new OO.ui.FieldLayout( input1, {
    label: 'Left-aligned label, the default', 
    align: 'left' 
  } ),

  new OO.ui.FieldLayout( input2, { 
    label: 'Right-aligned label',
    align: 'right' 
  } ),

new OO.ui.FieldLayout( selectFile, { 
    label: 'file',
    align: 'right' 
  } ),

  new OO.ui.FieldLayout( input3, { 
    label: 'Top-aligned label', 
    align: 'top', 
    help: 'A bit of help'
  } ),

  new OO.ui.FieldLayout( input4, { 
    label: 'Inline label', 
    align: 'inline' 
  } )
] );


var buttonOpen = new OO.ui.ButtonWidget( {
  label: 'OK',
  flags: [ 'progressive' ],
  target: '_blank'
} );    
buttonOpen.$element.attr("id","buttonopen");
buttonOpen.$element.css( 'float','right' );
buttonOpen.onClick=function() {
alert(":click" );
console.log(selectFile);
      var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
          console.log(e);
        };
      })(selectFile.getValue());

      // Read in the image file as a data URL.
      reader.readAsDataURL(selectFile.getValue());
    
dialogthat.close();
}

buttonOpen.connect(buttonOpen,{
 click:'onClick'
}
);
var buttonCancel = new OO.ui.ButtonWidget( {
  label: 'Cancel'
//  target: '_blank'
} );    
buttonCancel.$element.attr("id","buttoncancel");
buttonCancel.$element.css( 'float','right' );
buttonCancel.onClick=function() {
console.log(selectFile);
console.log(selectFile.getValue());

dialogthat.close();
}

buttonCancel.connect(buttonCancel,{
 click:'onClick'
}
)


// Example: Window added to the window manager by symbolic name. The class used to instantiate the window must be registered with a factory, which will create the window as needed. Note that the window manager is configured to use the factory via its 'factory' config setting.

// Create a factory
myFactory = new OO.Factory();

function MyDialog( config ) {
  MyDialog.super.call( this, config );
}
OO.inheritClass( MyDialog, OO.ui.ProcessDialog );

// Specify a symbolic name (e.g., 'simple', in this example) using the static 'name' property.
MyDialog.static.name = 'simple';
MyDialog.static.title = 'Simple dialog';
MyDialog.static.escapable = false;

MyDialog.prototype.getBodyHeight = function () {

return 500;
}

MyDialog.prototype.setDimensions = function (dim) {
  dialogthat=this;
console.log(dialogthat);
	this.$frame.css( {
		width: 800 || '',
		//minWidth: 800 || '',
		//maxWidth: 800 || '',
		height: 600 || ''
		//minHeight: 800 || '',
		//maxHeight: 800 || ''
	} );

	return this;
}
MyDialog.prototype.initialize = function () {
  MyDialog.super.prototype.initialize.call( this );
  this.content = new OO.ui.PanelLayout( { padded: true, expanded: false } );
 this.content.$element.append( fieldset.$element);
 //this.content.$element.append( buttonCancel.$element );
 //this.content.$element.append( buttonOpen.$element );
 buttonOpen.$element.insertBefore(".oo-ui-processDialog-actions-other");
buttonCancel.$element.insertBefore(".oo-ui-processDialog-actions-other");

 
  this.$body.append( this.content.$element );
this.$element
		.addClass( 'oo-ui-windowManager' )
		.toggleClass( 'oo-ui-windowManager-modal', true );
};

// Register the window constructor with the factory.
myFactory.register( MyDialog );

// Create a window manager. Specify the name of the factory with the ‘factory’ config.
var windowManager = new OO.ui.WindowManager( {
  factory: myFactory
} );
$( 'body' ).append( windowManager.$element );

// Open window by symbolic name.
windowManager.openWindow( 'simple', { size: 'medium' } );

$(".oo-ui-processDialog-location").height("60");

});
 

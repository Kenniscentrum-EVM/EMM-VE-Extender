 
//declare event to run when div is visible
/*$((function ($) {
      $.each(['show', 'hide'], function (i, ev) {
        var el = $.fn[ev];
        $.fn[ev] = function () {
          this.trigger(ev);
          return el.apply(this, arguments);
        };
      });
    })(jQuery);*/

function loadextra(){
//at start of dialog
//get pagenames for all pages, with Semantic title as a property
var pagenames = [];
var api = new mw.Api();
// Start a "GET" request
api.get( {
    action: 'ask',
    parameters:'limit:10000',//check how to increase limit of ask-result; done in LocalSettings.php
    query: '[[Modification date::+]]|?Modification date|?Semantic title'//get all pages; include property Semantic title
} ).done( function ( data ) {
  //parse data
  //first get results within data
    var res=data.query.results;

    //array to store results
    var arr=[];
    //for all objects in result
    for (prop in res) {
	if (!res.hasOwnProperty(prop)) {
	    //The current property is not a direct property of p
	    continue;
	}
	//property defined
	//now get pagename and Semantic title (if available)
	var pagename=res[prop].fulltext;
	var semantictitle=res[prop].printouts['Semantic title'];
	var title='';
	if (semantictitle.length>0) title=semantictitle[0].fulltext;
	 //set suggestion to Semantic title, if n.a. set it to pagename
	if (title.length>0)
	  arr.push({ value: title, data: pagename });
	else
	  arr.push({ value: pagename, data: pagename });
    }

    pagenames=arr;
});
 

	// Register plugins to VE. will be loaded once the user opens the VE

    if (typeof ve === 'undefined') {
      setTimeout(function() { mw.loader.using( 'ext.visualEditor.viewPageTarget.init',loadextra); }, 1000);
      console.log('ve undefined'); 
      return;
    }

    

    var makeInsertTool = function(buttonMessage, dialogueMessage, collection, element) {
	var dialogueName = collection + " dialogue",
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
	    { action: 'save', label: 'Insert', flags: [ 'primary', 'progressive' ] },
	    { action: 'cancel', label: 'Cancel', flags: 'safe' }
	];	


        dialogue.prototype.onDocumentTransact = function () {
console.log("transact");
        };
        dialogue.prototype.register = function () {
console.log("register");
        };

        dialogue.prototype.onSelect = function () {
console.log("select");
        };


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
  //get selected text from SurfaceModel
  var surfaceModel = ve.init.target.getSurface().getModel();
  selected="";
  for (i=surfaceModel.getFragment().range.start;i<surfaceModel.getFragment().range.end;i++){ 
    selected+=surfaceModel.getFragment().document.data.data[i];
  }
  //set text to selected, using timeout
  var inputfieldoutside=this.inputField;
  setTimeout(function() {

		    $(inputfieldoutside).val(selected);
	      }, 1000);
  //set autocomplete on resource-field
  var that=this;
  $(this.resourceField).autocomplete({
      lookup: pagenames,//pagenames are created at the start of dialog
      onSelect: function (suggestion) {
	//todo: see if following lines have meaning. If you delete them the field remains empty....
	var thehtml = '<strong>Currency Name:</strong> ' + suggestion.value + ' <br> <strong>Symbol:</strong> ' + suggestion.data;
	$('#searchfield').html(thehtml);
	console.log("code selected:"+suggestion.data);
	that.pageid=suggestion.data;
      },
      appendTo: this.resourceField.parentElement
    });
  //return height of dialog; this is main purpose of this function
    return 400;
}

	dialogue.prototype.initialize = function() {
	    var instance = this,
		currentSelection,
		/*
		 When we're finished with our dialogue, Insert a template in the page.
		 */
		insert = function() {
		    

			var mytemplate=  [
			    {
			      type: 'mwTransclusionInline',
			      attributes: {
				mw: {
				  parts: [
				    { template: {
					target: {
					  href: 'Template:ZomaarTemplate4',
					  wt: 'Citezomaar'
					},
					params: {
					  resource: { wt: this.pageid },
					  name: { wt: nameControl.getValue() },
					  optional: { wt: optionalControl.getValue() },
					}
				    }
				    }
				  ]
				}
			      }
			    }
			  ]
			;
		    ve.init.target
			.getSurface()
			.getModel()
			.getFragment()
			.collapseRangeToEnd()
			.insertContent(mytemplate, false);

		    instance.close();
		},

		nameControl = new OO.ui.InputWidget({
		    value: "nnnnnw"
		}),
		name = new OO.ui.FieldLayout(
		    nameControl,
		    {
			label: "Name"
		    }
		),
		
		resourceControl = new OO.ui.InputWidget({
		    value: "r"
		}),
		resource = new OO.ui.FieldLayout(
		    resourceControl,
		    {
			label: "Resource"
		    }
		),

		optionalControl = new OO.ui.InputWidget(),
		optional = new OO.ui.FieldLayout(
		    optionalControl,
		    {
			label: "Optional"
		    }),

		form = new OO.ui.FieldsetLayout({
		    $content: [
			name.$element,
			resource.$element,
			//lockToVersion.$element,
			optional.$element
		    ]
		}),

		panel = new OO.ui.PanelLayout({
		    padded: true
		}),

		stack = new OO.ui.StackLayout({
		    continuous: true,
		    scrollable: false,
		    items: [
			panel//,
			//searchPanel
		    ]
		});

	    OO.ui.ProcessDialog.prototype.initialize.call(this);

            this.nameControl=nameControl;
            
//at bottom of initialize function
//name control is defined in the previous lines
this.name=name;
this.resourceControl=resourceControl;
this.optionalControl=optionalControl;
//get javascript-element of name-field
var inputField=name.$field[0].firstElementChild.firstChild;
inputField.setAttribute("id", "autocomplete");
//store it in object so it can be retrieved later
this.inputField=inputField;

//get javascript-element of resource-field
var resourceField=resource.$field[0].firstElementChild.firstChild;
//store it in object so it can be retrieved later
this.resourceField=resourceField;
resource.$field[0].firstElementChild.setAttribute("id", "searchfield");
setTimeout(function() {
  //set values of input-field
  $(inputField).attr({
      'id':'autocomplete',
      'name':"currency",
      'class':'biginput'
  });
  //todo: see if on-show can be used as trigger to set selected value.
  $(inputField).on('show', function() {
	console.log('#foo is now visible');
  });
  $(inputField).on('hide', function() {
	console.log('#foo is now hidden');
  });
}, 1000);

	    this.content = stack;
	    this.insert = insert;

	    this.$body.append(this.content.$element);

	    panel.$element.append(form.$element);

	    nameControl.$input.attr("type", "text");

	    resourceControl.$input.attr("type", "text");

	    optionalControl.$input.attr("type", "text");
	    
	    nameControl.$input.css("width", "100%");
	    resourceControl.$input.css("width", "100%");
	    optionalControl.$input.css("width", "100%");

	};

	ve.ui.windowFactory.register(dialogue);

	/*
	 Make the tool.
	 */
	var tool = function(toolGroup, config) {
	    ve.ui.Tool.call(this, toolGroup, config);
	};

	OO.inheritClass(tool, ve.ui.Tool);
	tool.static.name = toolName,
	tool.static.title = buttonMessage;
	tool.static.dialog = dialogueName;
	tool.prototype.onSelect = function () {
	    this.toolbar.getSurface().execute('window', 'open', dialogueName, null);
	};    

	ve.ui.toolFactory.register(tool);
    };

    makeInsertTool(
	"Tekst in menu",
	"EigenTekst3",
	"process-models",
	"process-model"
    );

}
//mw.loader.using( 'ext.visualEditor.viewPageTarget.init',loadextra);
mw.hook( 've.activationComplete' ).add( function() {
	loadextra();

} );

/**
*  Ajax Autocomplete for jQuery, version %version%
*  (c) 2015 Tomas Kirda
*
*  Ajax Autocomplete for jQuery is freely distributable under the terms of an MIT-style license.
*  For details, see the web site: https://github.com/devbridge/jQuery-Autocomplete
*/

/*jslint  browser: true, white: true, plusplus: true, vars: true */
/*global define, window, document, jQuery, exports, require */

// Expose plugin as an AMD module if AMD loader is present:
(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if (typeof exports === 'object' && typeof require === 'function') {
        // Browserify
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {
    'use strict';

    var
        utils = (function () {
            return {
                escapeRegExChars: function (value) {
                    return value.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
                },
                createNode: function (containerClass) {
                    var div = document.createElement('div');
                    div.className = containerClass;
                    div.style.position = 'absolute';
                    div.style.display = 'none';
                    return div;
                }
            };
        }()),

        keys = {
            ESC: 27,
            TAB: 9,
            RETURN: 13,
            LEFT: 37,
            UP: 38,
            RIGHT: 39,
            DOWN: 40
        };

    function Autocomplete(el, options) {
        var noop = function () { },
            that = this,
            defaults = {
                ajaxSettings: {},
                autoSelectFirst: false,
                appendTo: document.body,
                serviceUrl: null,
                lookup: null,
                onSelect: null,
                width: 'auto',
                minChars: 1,
                maxHeight: 300,
                deferRequestBy: 0,
                params: {},
                formatResult: Autocomplete.formatResult,
                delimiter: null,
                zIndex: 9999,
                type: 'GET',
                noCache: false,
                onSearchStart: noop,
                onSearchComplete: noop,
                onSearchError: noop,
                preserveInput: false,
                containerClass: 'autocomplete-suggestions',
                tabDisabled: false,
                dataType: 'text',
                currentRequest: null,
                triggerSelectOnValidInput: true,
                preventBadQueries: true,
                lookupFilter: function (suggestion, originalQuery, queryLowerCase) {
                    return suggestion.value.toLowerCase().indexOf(queryLowerCase) !== -1;
                },
                paramName: 'query',
                transformResult: function (response) {
                    return typeof response === 'string' ? $.parseJSON(response) : response;
                },
                showNoSuggestionNotice: false,
                noSuggestionNotice: 'No results',
                orientation: 'bottom',
                forceFixPosition: false
            };

        // Shared variables:
        that.element = el;
        that.el = $(el);
        that.suggestions = [];
        that.badQueries = [];
        that.selectedIndex = -1;
        that.currentValue = that.element.value;
        that.intervalId = 0;
        that.cachedResponse = {};
        that.onChangeInterval = null;
        that.onChange = null;
        that.isLocal = false;
        that.suggestionsContainer = null;
        that.noSuggestionsContainer = null;
        that.options = $.extend({}, defaults, options);
        that.classes = {
            selected: 'autocomplete-selected',
            suggestion: 'autocomplete-suggestion'
        };
        that.hint = null;
        that.hintValue = '';
        that.selection = null;

        // Initialize and set options:
        that.initialize();
        that.setOptions(options);
    }

    Autocomplete.utils = utils;

    $.Autocomplete = Autocomplete;

    Autocomplete.formatResult = function (suggestion, currentValue) {
        // Do not replace anything if there current value is empty
        if (!currentValue) {
            return suggestion.value;
        }
        
        var pattern = '(' + utils.escapeRegExChars(currentValue) + ')';

        return suggestion.value
            .replace(new RegExp(pattern, 'gi'), '<strong>$1<\/strong>')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/&lt;(\/?strong)&gt;/g, '<$1>');
    };

    Autocomplete.prototype = {

        killerFn: null,

        initialize: function () {
            var that = this,
                suggestionSelector = '.' + that.classes.suggestion,
                selected = that.classes.selected,
                options = that.options,
                container;

            // Remove autocomplete attribute to prevent native suggestions:
            that.element.setAttribute('autocomplete', 'off');

            that.killerFn = function (e) {
                if ($(e.target).closest('.' + that.options.containerClass).length === 0) {
                    that.killSuggestions();
                    that.disableKillerFn();
                }
            };

            // html() deals with many types: htmlString or Element or Array or jQuery
            that.noSuggestionsContainer = $('<div class="autocomplete-no-suggestion"></div>')
                                          .html(this.options.noSuggestionNotice).get(0);

            that.suggestionsContainer = Autocomplete.utils.createNode(options.containerClass);

            container = $(that.suggestionsContainer);

            container.appendTo(options.appendTo);

            // Only set width if it was provided:
            if (options.width !== 'auto') {
                container.width(options.width);
            }

            // Listen for mouse over event on suggestions list:
            container.on('mouseover.autocomplete', suggestionSelector, function () {
                that.activate($(this).data('index'));
            });

            // Deselect active element when mouse leaves suggestions container:
            container.on('mouseout.autocomplete', function () {
                that.selectedIndex = -1;
                container.children('.' + selected).removeClass(selected);
            });

            // Listen for click event on suggestions list:
            container.on('click.autocomplete', suggestionSelector, function () {
                that.select($(this).data('index'));
            });

            that.fixPositionCapture = function () {
                if (that.visible) {
                    that.fixPosition();
                }
            };

            $(window).on('resize.autocomplete', that.fixPositionCapture);

            that.el.on('keydown.autocomplete', function (e) { that.onKeyPress(e); });
            that.el.on('keyup.autocomplete', function (e) { that.onKeyUp(e); });
            that.el.on('blur.autocomplete', function () { that.onBlur(); });
            that.el.on('focus.autocomplete', function () { that.onFocus(); });
            that.el.on('change.autocomplete', function (e) { that.onKeyUp(e); });
            that.el.on('input.autocomplete', function (e) { that.onKeyUp(e); });
        },

        onFocus: function () {
            var that = this;

            that.fixPosition();

            if (that.el.val().length >= that.options.minChars) {
                that.onValueChange();
            }
        },

        onBlur: function () {
            this.enableKillerFn();
        },
        
        abortAjax: function () {
            var that = this;
            if (that.currentRequest) {
                that.currentRequest.abort();
                that.currentRequest = null;
            }
        },

        setOptions: function (suppliedOptions) {
            var that = this,
                options = that.options;

            $.extend(options, suppliedOptions);

            that.isLocal = $.isArray(options.lookup);

            if (that.isLocal) {
                options.lookup = that.verifySuggestionsFormat(options.lookup);
            }

            options.orientation = that.validateOrientation(options.orientation, 'bottom');

            // Adjust height, width and z-index:
            $(that.suggestionsContainer).css({
                'max-height': options.maxHeight + 'px',
                'width': options.width + 'px',
                'z-index': options.zIndex
            });
        },


        clearCache: function () {
            this.cachedResponse = {};
            this.badQueries = [];
        },

        clear: function () {
            this.clearCache();
            this.currentValue = '';
            this.suggestions = [];
        },

        disable: function () {
            var that = this;
            that.disabled = true;
            clearInterval(that.onChangeInterval);
            that.abortAjax();
        },

        enable: function () {
            this.disabled = false;
        },

        fixPosition: function () {
            // Use only when container has already its content

            var that = this,
                $container = $(that.suggestionsContainer),
                containerParent = $container.parent().get(0);
            // Fix position automatically when appended to body.
            // In other cases force parameter must be given.
            if (containerParent !== document.body && !that.options.forceFixPosition) {
                return;
            }

            // Choose orientation
            var orientation = that.options.orientation,
                containerHeight = $container.outerHeight(),
                height = that.el.outerHeight(),
                offset = that.el.offset(),
                styles = { 'top': offset.top, 'left': offset.left };

            if (orientation === 'auto') {
                var viewPortHeight = $(window).height(),
                    scrollTop = $(window).scrollTop(),
                    topOverflow = -scrollTop + offset.top - containerHeight,
                    bottomOverflow = scrollTop + viewPortHeight - (offset.top + height + containerHeight);

                orientation = (Math.max(topOverflow, bottomOverflow) === topOverflow) ? 'top' : 'bottom';
            }

            if (orientation === 'top') {
                styles.top += -containerHeight;
            } else {
                styles.top += height;
            }

            // If container is not positioned to body,
            // correct its position using offset parent offset
            if(containerParent !== document.body) {
                var opacity = $container.css('opacity'),
                    parentOffsetDiff;

                    if (!that.visible){
                        $container.css('opacity', 0).show();
                    }

                parentOffsetDiff = $container.offsetParent().offset();
                styles.top -= parentOffsetDiff.top;
                styles.left -= parentOffsetDiff.left;

                if (!that.visible){
                    $container.css('opacity', opacity).hide();
                }
            }

            // -2px to account for suggestions border.
            if (that.options.width === 'auto') {
                styles.width = (that.el.outerWidth() - 2) + 'px';
            }

            $container.css(styles);
        },

        enableKillerFn: function () {
            var that = this;
            $(document).on('click.autocomplete', that.killerFn);
        },

        disableKillerFn: function () {
            var that = this;
            $(document).off('click.autocomplete', that.killerFn);
        },

        killSuggestions: function () {
            var that = this;
            that.stopKillSuggestions();
            that.intervalId = window.setInterval(function () {
                if (that.visible) {
                    that.el.val(that.currentValue);
                    that.hide();
                }
                
                that.stopKillSuggestions();
            }, 50);
        },

        stopKillSuggestions: function () {
            window.clearInterval(this.intervalId);
        },

        isCursorAtEnd: function () {
            var that = this,
                valLength = that.el.val().length,
                selectionStart = that.element.selectionStart,
                range;

            if (typeof selectionStart === 'number') {
                return selectionStart === valLength;
            }
            if (document.selection) {
                range = document.selection.createRange();
                range.moveStart('character', -valLength);
                return valLength === range.text.length;
            }
            return true;
        },

        onKeyPress: function (e) {
            var that = this;

            // If suggestions are hidden and user presses arrow down, display suggestions:
            if (!that.disabled && !that.visible && e.which === keys.DOWN && that.currentValue) {
                that.suggest();
                return;
            }

            if (that.disabled || !that.visible) {
                return;
            }

            switch (e.which) {
                case keys.ESC:
                    that.el.val(that.currentValue);
                    that.hide();
                    break;
                case keys.RIGHT:
                    if (that.hint && that.options.onHint && that.isCursorAtEnd()) {
                        that.selectHint();
                        break;
                    }
                    return;
                case keys.TAB:
                    if (that.hint && that.options.onHint) {
                        that.selectHint();
                        return;
                    }
                    if (that.selectedIndex === -1) {
                        that.hide();
                        return;
                    }
                    that.select(that.selectedIndex);
                    if (that.options.tabDisabled === false) {
                        return;
                    }
                    break;
                case keys.RETURN:
                    if (that.selectedIndex === -1) {
                        that.hide();
                        return;
                    }
                    that.select(that.selectedIndex);
                    break;
                case keys.UP:
                    that.moveUp();
                    break;
                case keys.DOWN:
                    that.moveDown();
                    break;
                default:
                    return;
            }

            // Cancel event if function did not return:
            e.stopImmediatePropagation();
            e.preventDefault();
        },

        onKeyUp: function (e) {
            var that = this;

            if (that.disabled) {
                return;
            }

            switch (e.which) {
                case keys.UP:
                case keys.DOWN:
                    return;
            }

            clearInterval(that.onChangeInterval);

            if (that.currentValue !== that.el.val()) {
                that.findBestHint();
                if (that.options.deferRequestBy > 0) {
                    // Defer lookup in case when value changes very quickly:
                    that.onChangeInterval = setInterval(function () {
                        that.onValueChange();
                    }, that.options.deferRequestBy);
                } else {
                    that.onValueChange();
                }
            }
        },

        onValueChange: function () {
            var that = this,
                options = that.options,
                value = that.el.val(),
                query = that.getQuery(value);

            if (that.selection && that.currentValue !== query) {
                that.selection = null;
                (options.onInvalidateSelection || $.noop).call(that.element);
            }

            clearInterval(that.onChangeInterval);
            that.currentValue = value;
            that.selectedIndex = -1;

            // Check existing suggestion for the match before proceeding:
            if (options.triggerSelectOnValidInput && that.isExactMatch(query)) {
                that.select(0);
                return;
            }

            if (query.length < options.minChars) {
                that.hide();
            } else {
                that.getSuggestions(query);
            }
        },

        isExactMatch: function (query) {
            var suggestions = this.suggestions;

            return (suggestions.length === 1 && suggestions[0].value.toLowerCase() === query.toLowerCase());
        },

        getQuery: function (value) {
            var delimiter = this.options.delimiter,
                parts;

            if (!delimiter) {
                return value;
            }
            parts = value.split(delimiter);
            return $.trim(parts[parts.length - 1]);
        },

        getSuggestionsLocal: function (query) {
            var that = this,
                options = that.options,
                queryLowerCase = query.toLowerCase(),
                filter = options.lookupFilter,
                limit = parseInt(options.lookupLimit, 10),
                data;

            data = {
                suggestions: $.grep(options.lookup, function (suggestion) {
                    return filter(suggestion, query, queryLowerCase);
                })
            };

            if (limit && data.suggestions.length > limit) {
                data.suggestions = data.suggestions.slice(0, limit);
            }

            return data;
        },

        getSuggestions: function (q) {
            var response,
                that = this,
                options = that.options,
                serviceUrl = options.serviceUrl,
                params,
                cacheKey,
                ajaxSettings;

            options.params[options.paramName] = q;
            params = options.ignoreParams ? null : options.params;

            if (options.onSearchStart.call(that.element, options.params) === false) {
                return;
            }

            if ($.isFunction(options.lookup)){
                options.lookup(q, function (data) {
                    that.suggestions = data.suggestions;
                    that.suggest();
                    options.onSearchComplete.call(that.element, q, data.suggestions);
                });
                return;
            }

            if (that.isLocal) {
                response = that.getSuggestionsLocal(q);
            } else {
                if ($.isFunction(serviceUrl)) {
                    serviceUrl = serviceUrl.call(that.element, q);
                }
                cacheKey = serviceUrl + '?' + $.param(params || {});
                response = that.cachedResponse[cacheKey];
            }

            if (response && $.isArray(response.suggestions)) {
                that.suggestions = response.suggestions;
                that.suggest();
                options.onSearchComplete.call(that.element, q, response.suggestions);
            } else if (!that.isBadQuery(q)) {
                that.abortAjax();

                ajaxSettings = {
                    url: serviceUrl,
                    data: params,
                    type: options.type,
                    dataType: options.dataType
                };

                $.extend(ajaxSettings, options.ajaxSettings);

                that.currentRequest = $.ajax(ajaxSettings).done(function (data) {
                    var result;
                    that.currentRequest = null;
                    result = options.transformResult(data, q);
                    that.processResponse(result, q, cacheKey);
                    options.onSearchComplete.call(that.element, q, result.suggestions);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    options.onSearchError.call(that.element, q, jqXHR, textStatus, errorThrown);
                });
            } else {
                options.onSearchComplete.call(that.element, q, []);
            }
        },

        isBadQuery: function (q) {
            if (!this.options.preventBadQueries){
                return false;
            }

            var badQueries = this.badQueries,
                i = badQueries.length;

            while (i--) {
                if (q.indexOf(badQueries[i]) === 0) {
                    return true;
                }
            }

            return false;
        },

        hide: function () {
            var that = this,
                container = $(that.suggestionsContainer);

            if ($.isFunction(that.options.onHide) && that.visible) {
                that.options.onHide.call(that.element, container);
            }

            that.visible = false;
            that.selectedIndex = -1;
            clearInterval(that.onChangeInterval);
            $(that.suggestionsContainer).hide();
            that.signalHint(null);
        },

        suggest: function () {
            if (this.suggestions.length === 0) {
                if (this.options.showNoSuggestionNotice) {
                    this.noSuggestions();
                } else {
                    this.hide();
                }
                return;
            }

            var that = this,
                options = that.options,
                groupBy = options.groupBy,
                formatResult = options.formatResult,
                value = that.getQuery(that.currentValue),
                className = that.classes.suggestion,
                classSelected = that.classes.selected,
                container = $(that.suggestionsContainer),
                noSuggestionsContainer = $(that.noSuggestionsContainer),
                beforeRender = options.beforeRender,
                html = '',
                category,
                formatGroup = function (suggestion, index) {
                        var currentCategory = suggestion.data[groupBy];

                        if (category === currentCategory){
                            return '';
                        }

                        category = currentCategory;

                        return '<div class="autocomplete-group"><strong>' + category + '</strong></div>';
                    };

            if (options.triggerSelectOnValidInput && that.isExactMatch(value)) {
                that.select(0);
                return;
            }

            // Build suggestions inner HTML:
            $.each(that.suggestions, function (i, suggestion) {
                if (groupBy){
                    html += formatGroup(suggestion, value, i);
                }

                html += '<div class="' + className + '" data-index="' + i + '">' + formatResult(suggestion, value) + '</div>';
            });

            this.adjustContainerWidth();

            noSuggestionsContainer.detach();
            container.html(html);

            if ($.isFunction(beforeRender)) {
                beforeRender.call(that.element, container);
            }

            that.fixPosition();
            container.show();

            // Select first value by default:
            if (options.autoSelectFirst) {
                that.selectedIndex = 0;
                container.scrollTop(0);
                container.children('.' + className).first().addClass(classSelected);
            }

            that.visible = true;
            that.findBestHint();
        },

        noSuggestions: function() {
             var that = this,
                 container = $(that.suggestionsContainer),
                 noSuggestionsContainer = $(that.noSuggestionsContainer);

            this.adjustContainerWidth();

            // Some explicit steps. Be careful here as it easy to get
            // noSuggestionsContainer removed from DOM if not detached properly.
            noSuggestionsContainer.detach();
            container.empty(); // clean suggestions if any
            container.append(noSuggestionsContainer);

            that.fixPosition();

            container.show();
            that.visible = true;
        },

        adjustContainerWidth: function() {
            var that = this,
                options = that.options,
                width,
                container = $(that.suggestionsContainer);

            // If width is auto, adjust width before displaying suggestions,
            // because if instance was created before input had width, it will be zero.
            // Also it adjusts if input width has changed.
            // -2px to account for suggestions border.
            if (options.width === 'auto') {
                width = that.el.outerWidth() - 2;
                container.width(width > 0 ? width : 300);
            }
        },

        findBestHint: function () {
            var that = this,
                value = that.el.val().toLowerCase(),
                bestMatch = null;

            if (!value) {
                return;
            }

            $.each(that.suggestions, function (i, suggestion) {
                var foundMatch = suggestion.value.toLowerCase().indexOf(value) === 0;
                if (foundMatch) {
                    bestMatch = suggestion;
                }
                return !foundMatch;
            });

            that.signalHint(bestMatch);
        },

        signalHint: function (suggestion) {
            var hintValue = '',
                that = this;
            if (suggestion) {
                hintValue = that.currentValue + suggestion.value.substr(that.currentValue.length);
            }
            if (that.hintValue !== hintValue) {
                that.hintValue = hintValue;
                that.hint = suggestion;
                (this.options.onHint || $.noop)(hintValue);
            }
        },

        verifySuggestionsFormat: function (suggestions) {
            // If suggestions is string array, convert them to supported format:
            if (suggestions.length && typeof suggestions[0] === 'string') {
                return $.map(suggestions, function (value) {
                    return { value: value, data: null };
                });
            }

            return suggestions;
        },

        validateOrientation: function(orientation, fallback) {
            orientation = $.trim(orientation || '').toLowerCase();

            if($.inArray(orientation, ['auto', 'bottom', 'top']) === -1){
                orientation = fallback;
            }

            return orientation;
        },

        processResponse: function (result, originalQuery, cacheKey) {
            var that = this,
                options = that.options;

            result.suggestions = that.verifySuggestionsFormat(result.suggestions);

            // Cache results if cache is not disabled:
            if (!options.noCache) {
                that.cachedResponse[cacheKey] = result;
                if (options.preventBadQueries && result.suggestions.length === 0) {
                    that.badQueries.push(originalQuery);
                }
            }

            // Return if originalQuery is not matching current query:
            if (originalQuery !== that.getQuery(that.currentValue)) {
                return;
            }

            that.suggestions = result.suggestions;
            that.suggest();
        },

        activate: function (index) {
            var that = this,
                activeItem,
                selected = that.classes.selected,
                container = $(that.suggestionsContainer),
                children = container.find('.' + that.classes.suggestion);

            container.find('.' + selected).removeClass(selected);

            that.selectedIndex = index;

            if (that.selectedIndex !== -1 && children.length > that.selectedIndex) {
                activeItem = children.get(that.selectedIndex);
                $(activeItem).addClass(selected);
                return activeItem;
            }

            return null;
        },

        selectHint: function () {
            var that = this,
                i = $.inArray(that.hint, that.suggestions);

            that.select(i);
        },

        select: function (i) {
            var that = this;
            that.hide();
            that.onSelect(i);
        },

        moveUp: function () {
            var that = this;

            if (that.selectedIndex === -1) {
                return;
            }

            if (that.selectedIndex === 0) {
                $(that.suggestionsContainer).children().first().removeClass(that.classes.selected);
                that.selectedIndex = -1;
                that.el.val(that.currentValue);
                that.findBestHint();
                return;
            }

            that.adjustScroll(that.selectedIndex - 1);
        },

        moveDown: function () {
            var that = this;

            if (that.selectedIndex === (that.suggestions.length - 1)) {
                return;
            }

            that.adjustScroll(that.selectedIndex + 1);
        },

        adjustScroll: function (index) {
            var that = this,
                activeItem = that.activate(index);

            if (!activeItem) {
                return;
            }

            var offsetTop,
                upperBound,
                lowerBound,
                heightDelta = $(activeItem).outerHeight();

            offsetTop = activeItem.offsetTop;
            upperBound = $(that.suggestionsContainer).scrollTop();
            lowerBound = upperBound + that.options.maxHeight - heightDelta;

            if (offsetTop < upperBound) {
                $(that.suggestionsContainer).scrollTop(offsetTop);
            } else if (offsetTop > lowerBound) {
                $(that.suggestionsContainer).scrollTop(offsetTop - that.options.maxHeight + heightDelta);
            }

            if (!that.options.preserveInput) {
                that.el.val(that.getValue(that.suggestions[index].value));
            }
            that.signalHint(null);
        },

        onSelect: function (index) {
            var that = this,
                onSelectCallback = that.options.onSelect,
                suggestion = that.suggestions[index];

            that.currentValue = that.getValue(suggestion.value);

            if (that.currentValue !== that.el.val() && !that.options.preserveInput) {
                that.el.val(that.currentValue);
            }

            that.signalHint(null);
            that.suggestions = [];
            that.selection = suggestion;

            if ($.isFunction(onSelectCallback)) {
                onSelectCallback.call(that.element, suggestion);
            }
        },

        getValue: function (value) {
            var that = this,
                delimiter = that.options.delimiter,
                currentValue,
                parts;

            if (!delimiter) {
                return value;
            }

            currentValue = that.currentValue;
            parts = currentValue.split(delimiter);

            if (parts.length === 1) {
                return value;
            }

            return currentValue.substr(0, currentValue.length - parts[parts.length - 1].length) + value;
        },

        dispose: function () {
            var that = this;
            that.el.off('.autocomplete').removeData('autocomplete');
            that.disableKillerFn();
            $(window).off('resize.autocomplete', that.fixPositionCapture);
            $(that.suggestionsContainer).remove();
        }
    };

    // Create chainable jQuery plugin:
    $.fn.autocomplete = $.fn.devbridgeAutocomplete = function (options, args) {
        var dataKey = 'autocomplete';
        // If function invoked without argument return
        // instance of the first matched element:
        if (arguments.length === 0) {
            return this.first().data(dataKey);
        }

        return this.each(function () {
            var inputElement = $(this),
                instance = inputElement.data(dataKey);

            if (typeof options === 'string') {
                if (instance && typeof instance[options] === 'function') {
                    instance[options](args);
                }
            } else {
                // If instance already exists, destroy it:
                if (instance && instance.dispose) {
                    instance.dispose();
                }
                instance = new Autocomplete(this, options);
                inputElement.data(dataKey, instance);
            }
        });
    };
}));

  var currencies1 = [
    { value: 'Afghan afghani', data: 'AFN' },
    { value: 'Albanian lek', data: 'ALL' },
    { value: 'Algerian dinar', data: 'DZD' },
    { value: 'European euro', data: 'EUR' },
    { value: 'Angolan kwanza', data: 'AOA' },
    { value: 'East Caribbean dollar', data: 'XCD' },
    { value: 'Argentine peso', data: 'ARS' },
    { value: 'Armenian dram', data: 'AMD' },
    { value: 'Aruban florin', data: 'AWG' },
    { value: 'Australian dollar', data: 'AUD' },
    { value: 'Azerbaijani manat', data: 'AZN' },
    { value: 'Bahamian dollar', data: 'BSD' },
    { value: 'Bahraini dinar', data: 'BHD' },
    { value: 'Bangladeshi taka', data: 'BDT' },
    { value: 'Barbadian dollar', data: 'BBD' },
    { value: 'Belarusian ruble', data: 'BYR' },
    { value: 'Belize dollar', data: 'BZD' },
    { value: 'West African CFA franc', data: 'XOF' },
    { value: 'Bhutanese ngultrum', data: 'BTN' },
    { value: 'Bolivian boliviano', data: 'BOB' },
    { value: 'Bosnia-Herzegovina konvertibilna marka', data: 'BAM' },
    { value: 'Botswana pula', data: 'BWP' },
    { value: 'Brazilian real', data: 'BRL' },
    { value: 'Brunei dollar', data: 'BND' },
    { value: 'Bulgarian lev', data: 'BGN' },
    { value: 'Burundi franc', data: 'BIF' },
    { value: 'Cambodian riel', data: 'KHR' },
    { value: 'Central African CFA franc', data: 'XAF' },
    { value: 'Canadian dollar', data: 'CAD' },
    { value: 'Cape Verdean escudo', data: 'CVE' },
    { value: 'Cayman Islands dollar', data: 'KYD' },
    { value: 'Chilean peso', data: 'CLP' },
    { value: 'Chinese renminbi', data: 'CNY' },
    { value: 'Colombian peso', data: 'COP' },
    { value: 'Comorian franc', data: 'KMF' },
    { value: 'Congolese franc', data: 'CDF' },
    { value: 'Costa Rican colon', data: 'CRC' },
    { value: 'Croatian kuna', data: 'HRK' },
    { value: 'Cuban peso', data: 'CUC' },
    { value: 'Czech koruna', data: 'CZK' },
    { value: 'Danish krone', data: 'DKK' },
    { value: 'Djiboutian franc', data: 'DJF' },
    { value: 'Dominican peso', data: 'DOP' },
    { value: 'Egyptian pound', data: 'EGP' },
    { value: 'Central African CFA franc', data: 'GQE' },
    { value: 'Eritrean nakfa', data: 'ERN' },
    { value: 'Estonian kroon', data: 'EEK' },
    { value: 'Ethiopian birr', data: 'ETB' },
    { value: 'Falkland Islands pound', data: 'FKP' },
    { value: 'Fijian dollar', data: 'FJD' },
    { value: 'CFP franc', data: 'XPF' },
    { value: 'Gambian dalasi', data: 'GMD' },
    { value: 'Georgian lari', data: 'GEL' },
    { value: 'Ghanaian cedi', data: 'GHS' },
    { value: 'Gibraltar pound', data: 'GIP' },
    { value: 'Guatemalan quetzal', data: 'GTQ' },
    { value: 'Guinean franc', data: 'GNF' },
    { value: 'Guyanese dollar', data: 'GYD' },
    { value: 'Haitian gourde', data: 'HTG' },
    { value: 'Honduran lempira', data: 'HNL' },
    { value: 'Hong Kong dollar', data: 'HKD' },
    { value: 'Hungarian forint', data: 'HUF' },
    { value: 'Icelandic krona', data: 'ISK' },
    { value: 'Indian rupee', data: 'INR' },
    { value: 'Indonesian rupiah', data: 'IDR' },
    { value: 'Iranian rial', data: 'IRR' },
    { value: 'Iraqi dinar', data: 'IQD' },
    { value: 'Israeli new sheqel', data: 'ILS' },
    { value: 'Jamaican dollar', data: 'JMD' },
    { value: 'Japanese yen', data: 'JPY' },
    { value: 'Jordanian dinar', data: 'JOD' },
    { value: 'Kazakhstani tenge', data: 'KZT' },
    { value: 'Kenyan shilling', data: 'KES' },
    { value: 'North Korean won', data: 'KPW' },
    { value: 'South Korean won', data: 'KRW' },
    { value: 'Kuwaiti dinar', data: 'KWD' },
    { value: 'Kyrgyzstani som', data: 'KGS' },
    { value: 'Lao kip', data: 'LAK' },
    { value: 'Latvian lats', data: 'LVL' },
    { value: 'Lebanese lira', data: 'LBP' },
    { value: 'Lesotho loti', data: 'LSL' },
    { value: 'Liberian dollar', data: 'LRD' },
    { value: 'Libyan dinar', data: 'LYD' },
    { value: 'Lithuanian litas', data: 'LTL' },
    { value: 'Macanese pataca', data: 'MOP' },
    { value: 'Macedonian denar', data: 'MKD' },
    { value: 'Malagasy ariary', data: 'MGA' },
    { value: 'Malawian kwacha', data: 'MWK' },
    { value: 'Malaysian ringgit', data: 'MYR' },
    { value: 'Maldivian rufiyaa', data: 'MVR' },
    { value: 'Mauritanian ouguiya', data: 'MRO' },
    { value: 'Mauritian rupee', data: 'MUR' },
    { value: 'Mexican peso', data: 'MXN' },
    { value: 'Moldovan leu', data: 'MDL' },
    { value: 'Mongolian tugrik', data: 'MNT' },
    { value: 'Moroccan dirham', data: 'MAD' },
    { value: 'Mozambican metical', data: 'MZM' },
    { value: 'Myanma kyat', data: 'MMK' },
    { value: 'Namibian dollar', data: 'NAD' },
    { value: 'Nepalese rupee', data: 'NPR' },
    { value: 'Netherlands Antillean gulden', data: 'ANG' },
    { value: 'New Zealand dollar', data: 'NZD' },
    { value: 'Nicaraguan cordoba', data: 'NIO' },
    { value: 'Nigerian naira', data: 'NGN' },
    { value: 'Norwegian krone', data: 'NOK' },
    { value: 'Omani rial', data: 'OMR' },
    { value: 'Pakistani rupee', data: 'PKR' },
    { value: 'Panamanian balboa', data: 'PAB' },
    { value: 'Papua New Guinean kina', data: 'PGK' },
    { value: 'Paraguayan guarani', data: 'PYG' },
    { value: 'Peruvian nuevo sol', data: 'PEN' },
    { value: 'Philippine peso', data: 'PHP' },
    { value: 'Polish zloty', data: 'PLN' },
    { value: 'Qatari riyal', data: 'QAR' },
    { value: 'Romanian leu', data: 'RON' },
    { value: 'Russian ruble', data: 'RUB' },
    { value: 'Rwandan franc', data: 'RWF' },
    { value: 'Saint Helena pound', data: 'SHP' },
    { value: 'Samoan tala', data: 'WST' },
    { value: 'Sao Tome and Principe dobra', data: 'STD' },
    { value: 'Saudi riyal', data: 'SAR' },
    { value: 'Serbian dinar', data: 'RSD' },
    { value: 'Seychellois rupee', data: 'SCR' },
    { value: 'Sierra Leonean leone', data: 'SLL' },
    { value: 'Singapore dollar', data: 'SGD' },
    { value: 'Slovak koruna', data: 'SKK' },
    { value: 'Solomon Islands dollar', data: 'SBD' },
    { value: 'Somali shilling', data: 'SOS' },
    { value: 'South African rand', data: 'ZAR' },
    { value: 'Sudanese pound', data: 'SDG' },
    { value: 'Sri Lankan rupee', data: 'LKR' },
    { value: 'Sudanese pound', data: 'SDG' },
    { value: 'Surinamese dollar', data: 'SRD' },
    { value: 'Swazi lilangeni', data: 'SZL' },
    { value: 'Swedish krona', data: 'SEK' },
    { value: 'Swiss franc', data: 'CHF' },
    { value: 'Syrian pound', data: 'SYP' },
    { value: 'New Taiwan dollar', data: 'TWD' },
    { value: 'Tajikistani somoni', data: 'TJS' },
    { value: 'Tanzanian shilling', data: 'TZS' },
    { value: 'Thai baht', data: 'THB' },
    { value: 'Paanga', data: 'TOP' },
    { value: 'Trinidad and Tobago dollar', data: 'TTD' },
    { value: 'Tunisian dinar', data: 'TND' },
    { value: 'Turkish new lira', data: 'TRY' },
    { value: 'Turkmen manat', data: 'TMM' },
    { value: 'Ugandan shilling', data: 'UGX' },
    { value: 'Ukrainian hryvnia', data: 'UAH' },
    { value: 'United Arab Emirates dirham', data: 'AED' },
    { value: 'British pound', data: 'GBP' },
    { value: 'United States dollar', data: 'USD' },
    { value: 'Uruguayan peso', data: 'UYU' },
    { value: 'Uzbekistani som', data: 'UZS' },
    { value: 'Vanuatu vatu', data: 'VUV' },
    { value: 'Venezuelan bolivar', data: 'VEB' },
    { value: 'Vietnamese dong', data: 'VND' },
    { value: 'Yemeni rial', data: 'YER' },
    { value: 'Zambian kwacha', data: 'ZMK' },
    { value: 'Zimbabwean dollar', data: 'ZWD' },
  ];

function loadExtenderUI(){

	/* remove some menu items */
	$('.oo-ui-toolbar-tools').find('.oo-ui-tool-name-link').remove(); /* Link */
	$('.oo-ui-toolbar-tools').find('.ve-test-toolbar-cite').remove(); /* Cite */
	$('.ve-test-toolbar-insert').find('.oo-ui-tool-name-referencesList').remove();  /* References list */
	$('.oo-ui-toolbar-tools').find('.oo-ui-tool-name-meta').remove(); /* Page options > Options */
	$('.oo-ui-toolbar-tools').find('.oo-ui-tool-name-settings').remove(); /* Page options > Page Settings */
	$('.oo-ui-toolbar-tools').find('.oo-ui-tool-name-advancedSettings').remove(); /* Page options > Advanced settings */
	$('.oo-ui-toolbar-tools').find('.oo-ui-tool-name-categories').remove(); /* Page options > Categories */
	$('.oo-ui-toolbar-tools').find('.oo-ui-tool-name-languages').remove(); /* Page options > Languages */
	$('.oo-ui-toolbar-tools').find('.oo-ui-icon-wikiText').remove(); /* Switch to source editing */
}

<?php
$wgExtensionCredits['semantic'][] = array(

    'path' => __FILE__,

    // The name of the extension, which will appear on Special:Version.
    'name' => 'EMM VE Extension',

    // A description of the extension, which will appear on Special:Version.
    'description' => 'EMM VE Extension, add functionality to Visual Editor',

    // The version of the extension, which will appear on Special:Version.
    // This can be a number or a string.
    'version' => '0.8.0',

    // Your name, which will appear on Special:Version.
    'author' => 'Anton Bil, Nick Pourquié, Carlo Geertse',

    // The URL to a wiki page/web page with information about the extension,
    // which will appear on Special:Version.
    'url' => 'https://www.mediawiki.org/wiki/API:Extensions',

);

$wgResourceModules['ext.EMMVEExtension'] = array(
    "scripts" => array("js/overrides/veExtenderTemplateProtection.js", "js/veExtenderValidation.js", "js/lib/veExtenderAutocomplete.js",
        "js/veExtenderLinks.js", "js/veExtenderLanguage.js", "js/overrides/veExtenderUI.js", "js/veExtender.js",
        "js/dialogs/veExtenderExitDialog.js", "js/dialogs/veExtenderFileDialog.js", "js/dialogs/veExtenderInternalLinkDialog.js",
        "js/dialogs/veExtenderExternalLinkDialog.js", "js/dialogs/veExtenderLightResourceDialog.js", "js/overrides/veExtenderDialogEdit.js",
        "js/dialogs/veExtenderBibliographicReferenceDialog.js"),
    'styles' => array('css/veExtender.css'),
    'position' => 'top',

    'localBasePath' => __DIR__,
    'remoteExtPath' => 'EMM-VE-Extender',
);

class EMMVEExtenderExtension
{

    public static function onBeforePageDisplay(OutputPage &$output, Skin &$skin)
    {
        $output->addModules('ext.EMMVEExtension');
        return true;
    }

}

// set Hook so module will be loaded
$wgHooks['BeforePageDisplay'][] = 'EMMVEExtenderExtension::onBeforePageDisplay';

?>

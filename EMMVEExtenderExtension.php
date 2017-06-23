<?php
$wgExtensionCredits['semantic'][] = array(

    'path' => __FILE__,

    // The name of the extension, which will appear on Special:Version.
    'name' => 'EMM VE Extension',

    // A description of the extension, which will appear on Special:Version.
    'description' => 'EMM VE Extension',

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

    const EMM_ACCESS_CONTROL = "EMM access control";

    /*
     //following code hides protecction-message from user
    //todo: check with Hans if this is necessary
     const ACCESSCONTROL_TAG = '<div style="display:none"><accesscontrol>';

    const ACCESSCONTROL_ENDTAG = '</accesscontrol></div>';*/
    const ACCESSCONTROL_TAG = '<accesscontrol>';

    const ACCESSCONTROL_ENDTAG = '</accesscontrol>';

    const END_TEMPLATE = "}}";

    public static function onBeforePageDisplay(OutputPage &$output, Skin &$skin)
    {
        $output->addModules('ext.EMMVEExtension');
        return true;
    }

    static function get_all_between($beginning, $end, $string) {
        $beginningPos = strpos($string, $beginning);
        $endPos = strpos($string, $end);
        if ($beginningPos === false || $endPos === false) {
            return "";
        }

        return substr($string, $beginningPos, ($endPos + strlen($end)) - $beginningPos);

    }

    static function delete_all_between($beginning, $end, $string) {
        $textToDelete = self::get_all_between($beginning, $end, $string);

        return str_replace($textToDelete, '', $string);
    }

    public static function onPageContentSave( WikiPage &$wikiPage, User &$user, Content &$content, &$summary,
                                              $isMinor, $isWatch, $section, &$flags,  Status&$status
    ) {
        // check, if the content model is wikitext to avoid adding wikitext to pages, that doesn't handle wikitext (e.g.
        // some JavaScript/JSON/CSS pages)
        if ( $content->getModel() === CONTENT_MODEL_WIKITEXT ) {
            // getNativeData returns the plain wikitext, which this Content object represent..
            $data = $content->getNativeData();
            // check whether text contains field
            $text="";
            $pos = strpos($data, self::EMM_ACCESS_CONTROL);
            if ( $pos>0 ) {//field always part of template, so never starts at position 0
                $pos+=+strlen(self::EMM_ACCESS_CONTROL);
                $text = substr($data, $pos, (strpos($data, PHP_EOL, $pos)) - $pos);
                $text = trim($text);
                $text = rtrim($text, ',');
                $text2 = ltrim($text, '=');
                if ($text!=$text2)
                    $text=$text2;
                else
                    $text="";
            }

            $textToDelete = self::get_all_between(self::ACCESSCONTROL_TAG, self::ACCESSCONTROL_ENDTAG, $data);
            wfDebug( 'text='.$text );
            //only do a page-change if accesscontrol has changed
            if (strcmp ($text,$textToDelete)!=0) {
                //remove old tags for accesscontrol, including content inbetween
                $data = self::delete_all_between(self::ACCESSCONTROL_TAG, self::ACCESSCONTROL_ENDTAG, $data);
                $data=str_replace(self::ACCESSCONTROL_TAG, '', $data);
                $data=str_replace(self::ACCESSCONTROL_ENDTAG, '', $data);

                if (strlen($text)>0) {

                    //look for place where text should be inserted; after current template-call
                    $pos2 = strpos($data, self::END_TEMPLATE, $pos)+2;

                    //is template already there? If not, put it on bottom of page
                    $totalTag = self::ACCESSCONTROL_TAG . $text . self::ACCESSCONTROL_ENDTAG;
                    if ($pos2>2)
                        // add/remove/replace tags and content
                        $data = substr_replace($data, $totalTag, $pos2, 0);
                    else
                        $data=$data.$totalTag;
                }
                // the new wikitext hss to be saved as a new Content object (Content doesn't support to replace/add content by itself)
                $content = new WikitextContent($data);
                wfDebug( 'access-control changed to:'.$text );
            }
            //otherwise do not change text
        } else
            wfDebug( 'access-control not changed' );

        return true;
    }
}

// set Hook so module will be loaded
$wgHooks['BeforePageDisplay'][] = 'EMMVEExtenderExtension::onBeforePageDisplay';
$wgHooks['PageContentSave'][] = 'EMMVEExtenderExtension::onPageContentSave';


?>

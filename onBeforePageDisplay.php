<?php

/**
 * User: Carlo Geertse
 * Date: 2-12-2016
 * Time: 16:28
 */
class EMMVEExtenderExtension
{

    public static function onBeforePageDisplay(OutputPage &$output, Skin &$skin)
    {
        $output->addModules('ext.EMMVEExtension');
        return true;
    }
}

?>
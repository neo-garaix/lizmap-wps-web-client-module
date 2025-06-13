<?php

namespace LizmapWPS\WPS;

class UrlServerUtil
{
    public static function retreiveServerURL($param)
    {
        $file = \jApp::varConfigPath('liveconfig.ini.php');
        $iniFile = new \Jelix\IniFile\IniModifier($file);

        return $iniFile->getValue($param, "wps");
    }
}

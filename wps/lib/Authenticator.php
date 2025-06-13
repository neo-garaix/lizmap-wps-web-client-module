<?php

namespace LizmapWPS\WPS;

use LizmapApi\Credentials;

class Authenticator
{
    public static function verify()
    {
        $restricted = self::retreiveAuthorization();

        if (!$restricted) {
            return true;
        }
        return \jAuth::isConnected();
    }

    private static function retreiveAuthorization()
    {
        $file = \jApp::varConfigPath('liveconfig.ini.php');
        $iniFile = new \Jelix\IniFile\IniModifier($file);

        if ($iniFile->getValue("restrict_to_authenticated_users", "wps") == "on") {
            return true;
        } else {
            return false;
        }
    }
}

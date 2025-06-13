<?php

namespace LizmapWPS\WPS;

class RequestHandler
{
    public static function curlRequestGET(string $url) : string
    {
        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: application/json',
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        return $response;
    }

    public static function curlRequestPOST(string $url, string $data) : string
    {
        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: application/json',
            'Prefer: respond-async',
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        return $response;
    }

    public static function curlRequestDELETE(string $url) : string
    {
        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: application/json',
        ]);

        $response = curl_exec($ch);
        curl_close($ch);

        return $response;
    }
}

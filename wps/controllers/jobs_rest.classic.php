<?php

use LizmapWPS\WPS\RestApiCtrl;
use LizmapWPS\WPS\UrlServerUtil;
use LizmapWPS\WPS\Error;
use LizmapWPS\WPS\RequestHandler;
use LizmapWPS\WPS\Authenticator;

class jobs_restCtrl extends RestApiCtrl
{
    public function get() : object
    {

        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        if (!Authenticator::verify()) {
            return Error::setError($rep, 401);
        }

        $url = UrlServerUtil::retreiveServerURL("pygiswps_server_url").'jobs';
        $jobID = $this->param('jobid');

        try {
            if ($jobID != null) {
                $response = RequestHandler::curlRequestGET($url.'/'.$jobID);
            } else {
                $response = RequestHandler::curlRequestGET($url);
            }
            $rep->data = json_decode($response, true);
        } catch (\Exception $e) {
            jLog::logEx($e, 'error');

            return Error::setError($rep, $e->getCode(), $e->getMessage());
        }
        return $rep;
    }

    public function delete() : object
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        if (!Authenticator::verify()) {
            return Error::setError($rep, 401);
        }

        $url = UrlServerUtil::retreiveServerURL("pygiswps_server_url").'jobs';
        $jobID = $this->param('jobid');

        try {
            if ($jobID != null) {
                $response = RequestHandler::curlRequestDELETE($url.'/'.$jobID);
            } else {
                $response = Error::setError($rep, "400");
            }
            $rep->data = json_decode($response, true);
        } catch (\Exception $e) {
            jLog::logEx($e, 'error');

            return Error::setError($rep, $e->getCode(), $e->getMessage());
        }
        return $rep;
    }
}

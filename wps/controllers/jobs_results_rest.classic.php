<?php

use LizmapWPS\WPS\Authenticator;
use LizmapWPS\WPS\RestApiCtrl;
use LizmapWPS\WPS\UrlServerUtil;
use LizmapWPS\WPS\Error;
use LizmapWPS\WPS\RequestHandler;

class jobs_results_restCtrl extends RestApiCtrl
{
    public function get() : object
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        if (!Authenticator::verify()) {
            return Error::setError($rep, 401);
        }

        $jobID = $this->param('jobid');

        try {
            if ($jobID != null) {
                $url = UrlServerUtil::retreiveServerURL("pygiswps_server_url").'jobs/'.$jobID.'/results';
                $response = RequestHandler::curlRequestGET($url);
            } else {
                $response = Error::setError($rep, "400", "Job id not found.");
            }
            $rep->data = json_decode($response, true);
        } catch (\Exception $e) {
            jLog::logEx($e, 'error');

            return Error::setError($rep, $e->getCode(), $e->getMessage());
        }
        return $rep;
    }
}

# homestar-wink
IOTDB / HomeStar Controller for Quirky / Wink Devices

<img src="https://github.com/dpjanes/iotdb-homestar/blob/master/docs/HomeStar.png" align="right" />

# Installation

Install Home☆Star first. 
See: https://github.com/dpjanes/iotdb-homestar#installation

Then

    $ homestar install homestar-wink

## Important Links

* http://branch.com/b/wink-api?ref=invite-link
* https://www.npmjs.com/package/node-winkapi
* http://docs.wink.apiary.io/

## Setup

    homestar set /bridges/WinkBridge/client_id '00000000000000000000000000000000'
    homestar set /bridges/WinkBridge/client_secret '00000000000000000000000000000000'
    homestar set /bridges/WinkBridge/username 'name@example.com'
    homestar set /bridges/WinkBridge/password '000000000'

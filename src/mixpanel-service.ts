/**
 * Copyright: ThoughtSpot Inc. 2019.
 * Author: Piyush Goyal (piyush@thoughtspot.com)
 *
 * @fileoverview Utility to push mixpanel events.
 */

'use strict';

import mixpanel from 'mixpanel-browser';

let CLUSTER_NAME = 'selfClusterName';
let CLUSTER_ID = 'selfClusterId';
let RELEASE = 'releaseVersion';
let ACCESS_TOKEN = 'mixpanelAccessToken';
let MIXPANEL_ENABLE = 'enableMixpanelService';
let USER = 'admin-app';

let _isEventCollectorOn = false;
let _config = {};

function setEventCollectorOn() {
    _isEventCollectorOn = true;
}

function isEventCollectorOn() {
    return _isEventCollectorOn;
}

function isMixpanelEnabled() {
    return false || _config[MIXPANEL_ENABLE];
}

// These are basic global properties that we set in application.
function getSessionProperties() {
    let props = {};
    props[RELEASE] = _config[RELEASE];
    props['clusterName'] = _config[CLUSTER_NAME];
    props['clusterId'] = _config[CLUSTER_ID];
    return props;
}

async function initConfig() : Promise<any> {
    let base_url = '';
    return fetch(`${base_url}/callosum/v1/system/config`)
        .then(response => {
            response.json().then(responseJson => {
                _config[MIXPANEL_ENABLE] = false || responseJson[MIXPANEL_ENABLE];
                _config[ACCESS_TOKEN] = '' || responseJson[ACCESS_TOKEN];
                _config[CLUSTER_NAME] = '' || responseJson[CLUSTER_NAME];
                _config[CLUSTER_ID] = '' || responseJson[CLUSTER_ID];
            });
        }).catch(error => {
            _config[MIXPANEL_ENABLE] = false;
        });
}

async function setVersion() : Promise<any> {
    let base_url = '';
    return fetch(`${base_url}/release?rand=` + Date.now())
        .then(response => {
            response.text().then((text) =>
                _config[RELEASE] = text
            );
        });
}

/**
 * Init mixpanel service to allow collecting events.
 *
 **/
export async function initMixpanel() : Promise<any> {
    await initConfig();
    await setVersion();

    if (!isMixpanelEnabled()) {
        return Promise.resolve();
    }
    mixpanel.init(_config[ACCESS_TOKEN]);
    mixpanel.identify(USER);
    setEventCollectorOn();
    return Promise.resolve();
}

/**
 * Pushes the event with its Property key-value map to mixpanel.
 * @param eventId
 * @param eventProps
 */
export async function uploadEvent(eventId, eventProps = {}) : Promise<any> {
    if (!isEventCollectorOn()) {
        return Promise.resolve();
    }
    Object.assign(
        eventProps,
        getSessionProperties(),
    );
    return new Promise(() => mixpanel.track(eventId, eventProps));
}

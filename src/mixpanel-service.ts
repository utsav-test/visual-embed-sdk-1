import * as mixpanel from 'mixpanel-browser';
import { getSessionInfo } from './auth';

export const MIXPANEL_EVENT = {
    VISUAL_SDK_RENDER_START: 'visual-sdk-render-start',
    VISUAL_SDK_CALLED_INIT: 'visual-sdk-called-init',
    VISUAL_SDK_IFRAME_LOAD_PERFORMANCE: 'visual-sdk-iframe-load-performance',
}

let _isEventCollectorOn = false;
let eventCollecctorQueue: { eventId: string, eventProps: any }[] = [];

function setEventCollectorOn() {
    _isEventCollectorOn = true;
}

function isEventCollectorOn() {
    return _isEventCollectorOn;
}

function emptyQueue() {
    eventCollecctorQueue.forEach((event) => {
        uploadMixpanelEvent(event.eventId, event.eventProps);
    })
}

/**
 * Init mixpanel service to allow collecting events.
 *
 **/
export async function initMixpanel(thoughtSpotHost: string) : Promise<any> {
    const { data } = await getSessionInfo(thoughtSpotHost);
    const token = data.configInfo.mixpanelAccessToken;
    if (token) {
        mixpanel.init(data.configInfo.mixpanelAccessToken);
        setEventCollectorOn();
        emptyQueue();
    }
}

/**
 * Pushes the event with its Property key-value map to mixpanel.
 * @param eventId
 * @param eventProps
 */
export async function uploadMixpanelEvent(eventId: string, eventProps = {}) : Promise<any> {
    if (!isEventCollectorOn()) {
        eventCollecctorQueue.push({ eventId, eventProps })
        return Promise.resolve();
    }
    return new Promise(() => mixpanel.track(eventId, eventProps));
}

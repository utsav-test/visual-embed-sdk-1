import * as mixpanel from 'mixpanel-browser';
import { getSessionInfo } from './auth';

export const MIXPANEL_EVENT = {
    VISUAL_SDK_RENDER_START: 'visual-sdk-render-start',
    VISUAL_SDK_CALLED_INIT: 'visual-sdk-called-init',
    VISUAL_SDK_IFRAME_LOAD_PERFORMANCE: 'visual-sdk-iframe-load-performance',
};

const nodeEnv = process.env.NODE_ENV;
const TEST_ENV = 'test';

let isEventCollectorOn = false;
const eventCollectorQueue: { eventId: string; eventProps: any }[] = [];

function setEventCollectorOn() {
    isEventCollectorOn = true;
}

function getEventCollectorOnValue() {
    return isEventCollectorOn;
}

/**
 * Pushes the event with its Property key-value map to mixpanel.
 * @param eventId
 * @param eventProps
 */
export async function uploadMixpanelEvent(
    eventId: string,
    eventProps = {},
): Promise<any> {
    if (!getEventCollectorOnValue()) {
        eventCollectorQueue.push({ eventId, eventProps });
        return Promise.resolve();
    }
    return new Promise(() => mixpanel.track(eventId, eventProps));
}

function emptyQueue() {
    eventCollectorQueue.forEach((event) => {
        uploadMixpanelEvent(event.eventId, event.eventProps);
    });
}

export async function initMixpanel(thoughtSpotHost: string): Promise<any> {
    if (nodeEnv === TEST_ENV) {
        Promise.resolve();
        return;
    }

    const { data } = await getSessionInfo(thoughtSpotHost);
    const token = data.configInfo?.mixpanelAccessToken;
    if (token) {
        mixpanel.init(data.configInfo.mixpanelAccessToken);
        setEventCollectorOn();
        emptyQueue();
    }
}

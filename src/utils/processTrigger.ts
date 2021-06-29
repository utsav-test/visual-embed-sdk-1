import { HostEvent } from '../types';

/**
 * Reloads the ThoughtSpot iframe.
 */
function reload(iFrame: HTMLIFrameElement) {
    const oldFrame = iFrame.cloneNode();
    const parent = iFrame.parentNode;
    parent.removeChild(iFrame);
    parent.appendChild(oldFrame);
}

export function processTrigger(
    iFrame: HTMLIFrameElement,
    messageType: HostEvent,
    thoughtSpotHost: string,
    data: any,
) {
    switch (messageType) {
        case HostEvent.Reload:
            return reload(iFrame);
        default:
            return iFrame.contentWindow.postMessage(
                {
                    type: messageType,
                    data,
                },
                thoughtSpotHost,
            );
    }
}

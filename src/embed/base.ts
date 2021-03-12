/**
 * Copyright (c) 2021
 *
 * Base classes
 *
 * @summary Base classes
 * @author Ayon Ghosh <ayon.ghosh@thoughtspot.com>
 */

import { getCssDimension } from '../utils';
import {
    getThoughtSpotHost,
    URL_MAX_LENGTH,
    DEFAULT_EMBED_WIDTH,
    DEFAULT_EMBED_HEIGHT,
    getV2BasePath,
} from '../config';
import {
    DOMSelector,
    EmbedConfig,
    HostEvent,
    EmbedEvent,
    MessageCallback,
} from '../types';
import { initialize } from '../v1/api';

let config = {} as EmbedConfig;

/**
 * Initialize the ThoughtSpot embed settings globally
 * @param embedConfig The configuration object containing ThoughtSpot host,
 * authentication mecheanism etc.
 */
export const init = (embedConfig: EmbedConfig): void => {
    config = embedConfig;
};

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface LayoutConfig {}

export interface FrameParams {
    // unit is pixels if number
    width?: number | string;
    height?: number | string;
}

export interface ViewConfig {
    layoutConfig?: LayoutConfig;
    frameParams?: FrameParams;
    theme?: string;
    // eslint-disable-next-line camelcase
    styleSheet__unstable?: string;
}

/**
 * Base class for embedding v2 experience
 * Note: the v2 version of ThoughtSpot Blink is built on the new stack:
 * React+GraphQL
 */
export class TsEmbed {
    /**
     * The DOM node where the ThoughtSpot app is to be embedded
     */
    private el: Element;

    /**
     * A reference to the iframe within which the ThoughtSpot app
     * will be rendered
     */
    protected iFrame: HTMLIFrameElement;

    /**
     * The ThoughtSpot host name or IP address
     */
    protected thoughtSpotHost: string;

    /*
     * This the base to access ThoughtSpot V2.
     */
    protected thoughtSpotV2Base: string;

    /**
     * A map of event handlers for particular message types triggered
     * by the embdedded app; multiple event handlers can be registered
     * against a particular message type
     */
    private eventHandlerMap: Map<string, MessageCallback[]>;

    /**
     * A flag that is set to true post render
     */
    private isRendered: boolean;

    constructor(domSelector: DOMSelector) {
        this.el = this.getDOMNode(domSelector);
        // TODO: handle error
        this.thoughtSpotHost = getThoughtSpotHost(config);
        this.thoughtSpotV2Base = getV2BasePath(config);
        this.eventHandlerMap = new Map();
    }

    /**
     * Get a reference to the root DOM node where
     * the embedded content will appear
     * @param domSelector
     */
    private getDOMNode(domSelector: DOMSelector) {
        return typeof domSelector === 'string'
            ? document.querySelector(domSelector)
            : domSelector;
    }

    /**
     * Throw error encountered during initialization
     */
    private throwInitError() {
        this.handleError('You need to init the ThoughtSpot SDK module first');
    }

    /**
     * Handle errors within the SDK
     * @param error The error message or object
     */
    protected handleError(error: string | Record<string, unknown>) {
        this.executeCallbacks(EmbedEvent.Error, {
            error,
        });
        // Log error
        console.log(error);
    }

    /**
     * Extract the type field from the event payload
     * @param event The window message event
     */
    protected getEventType(event: MessageEvent) {
        return event.data?.type;
    }

    /**
     * Add an global event listener to window for "message" events
     * We detect if a particular event is targeted to this particular
     * embed instance through an identifier contained in the payload,
     * and execute the registere callbacks accordingly
     */
    private subscribeToEvents() {
        const onAuthExpire = () =>
            this.executeCallbacks(EmbedEvent.AuthExpire, null);

        const onInit = (isInitialized: boolean) =>
            this.executeCallbacks(EmbedEvent.AuthInit, isInitialized);

        initialize(
            onInit,
            onAuthExpire,
            this.getThoughtSpotHost(),
            config.authType,
        );

        window.addEventListener('message', (event) => {
            const eventType = this.getEventType(event);
            if (event.source === this.iFrame.contentWindow) {
                this.executeCallbacks(eventType, event.data);
            }
        });
    }

    /**
     * Construct the base URL string to load the ThoughtSpot app
     */
    protected getEmbedBasePath(): string {
        return [this.thoughtSpotHost, this.thoughtSpotV2Base, '#', 'embed']
            .filter((x) => x.length > 0)
            .join('/');
    }

    /**
     * Construct the base URL string to load v1 of the ThoughtSpot app
     * This is used for pinboards, visualizations and full app embedding
     * @param queryString Query string to append to the URL
     * @param isAppEmbed A Boolean parameter to specify if we're embedding
     * the full app
     */
    protected getV1EmbedBasePath(
        queryString: string,
        showPrimaryNavbar = false,
        isAppEmbed = false,
    ): string {
        const queryStringFrag = queryString ? `&${queryString}` : '';
        const primaryNavParam = `&primaryNavHidden=${!showPrimaryNavbar}`;
        const queryParams = `?embedApp=true${
            isAppEmbed ? primaryNavParam : ''
        }${queryStringFrag}`;
        let path = `${this.thoughtSpotHost}/${queryParams}#`;
        if (!isAppEmbed) {
            path = `${path}/embed`;
        }

        return path;
    }

    /**
     * Renders the embedded ThoughtSpot app in an iframe and sets up
     * event listeners
     * @param url
     * @param frameOptions
     */
    protected renderIFrame(url: string, frameOptions: FrameParams): void {
        if (!this.thoughtSpotHost) {
            this.throwInitError();
        }
        if (url.length > URL_MAX_LENGTH) {
            // warn: URL too long
        }

        this.executeCallbacks(EmbedEvent.Init, {
            data: {
                timestamp: Date.now(),
            },
        });
        this.iFrame = document.createElement('iframe');
        this.iFrame.src = url;
        const width = getCssDimension(
            frameOptions?.width || DEFAULT_EMBED_WIDTH,
        );
        const height = getCssDimension(
            frameOptions?.height || DEFAULT_EMBED_HEIGHT,
        );
        this.iFrame.style.width = `${width}`;
        this.iFrame.style.height = `${height}`;
        this.iFrame.style.border = '0';
        this.iFrame.name = 'ThoughtSpot Embedded Analytics';
        this.iFrame.addEventListener('load', () =>
            this.executeCallbacks(EmbedEvent.Load, {
                data: {
                    timestamp: Date.now(),
                },
            }),
        );
        this.el.appendChild(this.iFrame);

        this.subscribeToEvents();
    }

    /**
     * Set the height of the iframe
     * @param height The height in pixels
     */
    protected setIFrameHeight(height: number): void {
        this.iFrame.style.height = `${height}px`;
    }

    /**
     * Execute all registered event handlers for a particular event type
     * @param eventType The event type
     * @param data The payload the event handler will be invoked with
     */
    protected executeCallbacks(eventType: EmbedEvent, data: any): void {
        const callbacks = this.eventHandlerMap.get(eventType) || [];
        callbacks.forEach((callback) => callback(data));
    }

    /**
     * Return the ThoughtSpot host name or IP address
     */
    protected getThoughtSpotHost(): string {
        return this.thoughtSpotHost;
    }

    /**
     * Register an event listener to be triggered when we receive
     * an event of a particular message type from the embedded app
     * @param messageType The message type
     * @param callback A callback function
     */
    public on(
        messageType: EmbedEvent,
        callback: MessageCallback,
    ): typeof TsEmbed.prototype {
        if (this.isRendered) {
            this.handleError(
                'Please register event handlers before calling render',
            );
        }

        const callbacks = this.eventHandlerMap.get(messageType) || [];
        callbacks.push(callback);
        this.eventHandlerMap.set(messageType, callbacks);

        return this;
    }

    /**
     * Trigger a message event to the embedded app
     * @param messageType The message type
     * @param data The payload to send with the message
     */
    public trigger(
        messageType: HostEvent,
        data: any,
    ): typeof TsEmbed.prototype {
        this.iFrame.contentWindow.postMessage(
            {
                type: messageType,
                data,
            },
            this.thoughtSpotHost,
        );

        return this;
    }

    /**
     * Mark the ThoughtSpot object to have been rendered
     * Needs to be overridden by subclasses to do the actual
     * rendering of the iframe.
     * @param args
     */
    public render(...args: any[]): TsEmbed {
        this.isRendered = true;
        return this;
    }
}

/**
 * Base class for embedding v1 experience
 * Note: The v1 version of ThoughtSpot Blink works on the AngularJS stack
 * which is currently under migration to v2
 */
export class V1Embed extends TsEmbed {
    protected viewConfig: ViewConfig;

    constructor(domSelector: DOMSelector, viewConfig: ViewConfig) {
        super(domSelector);
        this.viewConfig = viewConfig;
    }

    /**
     * Render the app in an iframe and set up event handlers
     * @param iframeSrc
     */
    protected renderV1Embed(iframeSrc: string): void {
        this.renderIFrame(iframeSrc, this.viewConfig.frameParams);
    }

    /**
     * @override
     * @param event
     */
    protected getEventType(event: MessageEvent) {
        // eslint-disable-next-line no-underscore-dangle
        return event.data?.__type;
    }

    /**
     * @override
     * @param messageType
     * @param callback
     */
    public on(
        messageType: EmbedEvent,
        callback: MessageCallback,
    ): typeof TsEmbed.prototype {
        return super.on(messageType, callback);
    }
}
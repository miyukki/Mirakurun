/// <reference path="../typings/globals/node/index.d.ts" />
/// <reference path="../typings/globals/js-yaml/index.d.ts" />
import * as http from "http";
import * as apid from "../api.d.ts";
export declare type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";
export interface RequestOption {
    /** positive integer */
    priority?: number;
    /** request headers */
    headers?: {
        [key: string]: string;
    };
    /** request query */
    query?: {
        [key: string]: any;
    };
    /** request body */
    body?: string | Object;
}
export interface Response {
    status: number;
    statusText: string;
    contentType: string;
    headers: {
        [key: string]: string;
    };
    isSuccess: boolean;
    body?: Object | Buffer;
}
export interface ErrorResponse extends Response {
    body?: apid.Error;
}
export interface ChannelsQuery {
    type?: apid.ChannelType;
    channel?: string;
    name?: string;
}
export interface ProgramsQuery {
    networkId?: apid.NetworkId;
    serviceId?: apid.ServiceId;
    eventId?: apid.EventId;
}
export interface EventsQuery {
    resource?: apid.EventResource;
    type?: apid.EventType;
}
export interface ServicesQuery {
    serviceId?: apid.ServiceId;
    networkId?: apid.NetworkId;
    name?: string;
    type?: number;
    "channel.type"?: apid.ChannelType;
    "channel.channel"?: string;
}
export default class Client {
    basePath: string;
    /** positive integer */
    priority: number;
    host: string;
    port: number;
    socketPath: string;
    agent: http.Agent | boolean;
    /** provide User-Agent string to identify client. */
    userAgent: string;
    private _userAgent;
    constructor();
    private _httpRequest(method, path, option?);
    private _requestStream(method, path, option?);
    private _getTS(path, decode?);
    request(method: RequestMethod, path: string, option?: RequestOption): Promise<Response> | Promise<ErrorResponse>;
    getChannels(query?: ChannelsQuery): Promise<apid.Channel[]>;
    getChannelsByType(type: apid.ChannelType, query?: ChannelsQuery): Promise<apid.Channel[]>;
    getChannel(type: apid.ChannelType, channel: string): Promise<apid.Channel>;
    getServicesByChannel(type: apid.ChannelType, channel: string): Promise<apid.Service[]>;
    getServiceByChannel(type: apid.ChannelType, channel: string, sid: apid.ServiceId): Promise<apid.Service>;
    getServiceStreamByChannel(type: apid.ChannelType, channel: string, sid: apid.ServiceId, decode?: boolean): Promise<http.IncomingMessage>;
    getChannelStream(type: apid.ChannelType, channel: string, decode?: boolean): Promise<http.IncomingMessage>;
    getPrograms(query?: ProgramsQuery): Promise<apid.Program[]>;
    getProgram(id: apid.ProgramId): Promise<apid.Program>;
    getProgramStream(id: apid.ProgramId, decode?: boolean): Promise<http.IncomingMessage>;
    getServices(query?: ServicesQuery): Promise<apid.Service[]>;
    getService(id: apid.ServiceItemId): Promise<apid.Service>;
    getLogoImage(id: apid.ServiceItemId): Promise<Buffer>;
    getServiceStream(id: apid.ServiceItemId, decode?: boolean): Promise<http.IncomingMessage>;
    getTuners(): Promise<apid.TunerDevice[]>;
    getTuner(index: number): Promise<apid.TunerDevice>;
    getTunerProcess(index: number): Promise<apid.TunerProcess>;
    killTunerProcess(index: number): Promise<apid.TunerProcess>;
    getEvents(): Promise<apid.Event[]>;
    getEventsStream(query?: EventsQuery): Promise<http.IncomingMessage>;
    getChannelsConfig(): Promise<apid.ConfigChannels>;
    updateChannelsConfig(channels: apid.ConfigChannels): Promise<apid.ConfigChannels>;
    getServerConfig(): Promise<apid.ConfigServer>;
    updateServerConfig(server: apid.ConfigServer): Promise<apid.ConfigServer>;
    getTunersConfig(): Promise<apid.ConfigTuners>;
    updateTunersConfig(tuners: apid.ConfigTuners): Promise<apid.ConfigTuners>;
    getLog(): Promise<string>;
    getLogStream(): Promise<http.IncomingMessage>;
    checkVersion(): Promise<apid.Version>;
    updateVersion(force?: boolean): Promise<http.IncomingMessage>;
    getStatus(): Promise<apid.Status>;
}

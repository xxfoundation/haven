import { ChannelJSON, IdentityJSON, IsReadyInfoJSON, ShareURLJSON, VersionJSON } from 'src/types';
import { Err, JsonDecoder } from 'ts.data.json';

export const makeDecoder = <T>(decoder: JsonDecoder.Decoder<T>) => (thing: unknown): T => {
  const result = decoder.decode(thing);
  if (result instanceof Err) {
    throw new Error(`Unexpected JSON: ${JSON.stringify(thing)}, Error: ${result.error}`);
  } else {
    return result.value;
  }
}

export const channelDecoder = makeDecoder(JsonDecoder.object<ChannelJSON>(
  {
    receptionId: JsonDecoder.optional(JsonDecoder.string),
    channelId: JsonDecoder.optional(JsonDecoder.string),
    name: JsonDecoder.string,
    description: JsonDecoder.string,
  },
  'ChannelDecoder',
  {
    receptionId: 'ReceptionID',
    channelId: 'ChannelID',
    name: 'Name',
    description: 'Description'
  }
));

export const identityDecoder = makeDecoder(JsonDecoder.object<IdentityJSON>(
  {
    pubkey: JsonDecoder.string,
    codename: JsonDecoder.string,
    color: JsonDecoder.string,
    extension: JsonDecoder.string,
    codeset: JsonDecoder.number
  },
  'IdentityDecoder',
  {
    pubkey: 'PubKey',
    codename: 'Codename',
    color: 'Color',
    extension: 'Extension',
    codeset: 'CodesetVersion'
  }
));

export const shareUrlDecoder = makeDecoder(JsonDecoder.object<ShareURLJSON>({
  password: JsonDecoder.optional(JsonDecoder.string),
  url: JsonDecoder.string
}, 'ShareUrlDecoder'));

export const isReadyInfoDecoder = makeDecoder(JsonDecoder.object<IsReadyInfoJSON>({
  isReady: JsonDecoder.boolean,
  howClose: JsonDecoder.number
}, 'IsReadyInfoDecoder', {
  isReady: 'IsReady',
  howClose: 'HowClose'
}))

export const pubkeyArrayDecoder = makeDecoder(JsonDecoder.array<string>(JsonDecoder.string, 'PubkeyArrayDecoder'));

export const versionDecoder = makeDecoder(JsonDecoder.object<VersionJSON>({
  current: JsonDecoder.string,
  updated: JsonDecoder.boolean,
  old: JsonDecoder.string
}, 'VersionDecoder'));

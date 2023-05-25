import { AllowList, AllowLists, ChannelId, ChannelJSON, IdentityJSON, IsReadyInfoJSON, MessageDeletedEvent, MessageReceivedEvent, NicknameUpdatedEvent, NotificationFilter, NotificationLevel, NotificationState, NotificationStatus, NotificationUpdateEvent, ShareURLJSON, UserMutedEvent, VersionJSON } from 'src/types';
import { KVEntry } from 'src/types/collective';
import { Err, JsonDecoder } from 'ts.data.json';
import { decoder as uintDecoder } from './index';


const attemptParse = (object: unknown) => {
  let parsed = object;
  if (typeof object === 'string') {
    try {
      parsed = JSON.parse(object);
    } catch (e) {
      console.error('Failed to parse string in decoder', object);
    }
  }
  return parsed;
}

export const makeDecoder = <T>(decoder: JsonDecoder.Decoder<T>) => (thing: unknown): T => {
  const object = thing instanceof Uint8Array ? uintDecoder.decode(thing) : thing;
  const parsed = typeof object === 'string' ? attemptParse(object) : object;
  const result = decoder.decode(parsed);
  if (result instanceof Err) {
    throw new Error(`Unexpected JSON: ${JSON.stringify(parsed)} for decoder ${name}, Error: ${result.error}`);
  } else {
    return result.value;
  }
}

export type Decoder<T> = ReturnType<typeof makeDecoder<T>>;

const uint8ArrayDecoder = JsonDecoder.array(JsonDecoder.number, 'Uint8Decoder');

const uint8ArrayToStringDecoder = uint8ArrayDecoder.map((uintArray) => uintDecoder.decode(uintArray as unknown as Uint8Array))

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

export const shareUrlDecoder = makeDecoder(JsonDecoder.object<ShareURLJSON>(
  {
    password: JsonDecoder.optional(JsonDecoder.string),
    url: JsonDecoder.string
  },
  'ShareUrlDecoder'
));

export const isReadyInfoDecoder = makeDecoder(JsonDecoder.object<IsReadyInfoJSON>({
  isReady: JsonDecoder.boolean,
  howClose: JsonDecoder.number
}, 'IsReadyInfoDecoder', {
  isReady: 'IsReady',
  howClose: 'HowClose'
}))

export const pubkeyArrayDecoder = makeDecoder(JsonDecoder.array<string>(JsonDecoder.string, 'PubkeyArrayDecoder'));

export const versionDecoder = makeDecoder(JsonDecoder.object<VersionJSON>(
  {
    current: JsonDecoder.string,
    updated: JsonDecoder.boolean,
    old: JsonDecoder.string
  },
  'VersionDecoder'
));

export const kvEntryDecoder = makeDecoder(JsonDecoder.object<KVEntry>(
  {
    data: JsonDecoder.string,
    version: JsonDecoder.number,
    timestamp: JsonDecoder.string,
  }, 'KVEntryDecoder', {
    data: 'Data',
    version: 'Version',
    timestamp: 'Timestamp'
  }
));

export const messageReceivedEventDecoder = makeDecoder(JsonDecoder.object<MessageReceivedEvent>(
  {
    uuid: JsonDecoder.number,
    channelId: JsonDecoder.string,
    update: JsonDecoder.boolean,
  },
  'MessageReceivedEventDecoder',
  {
    channelId: 'channelID',
  }
));

export const userMutedEventDecoder = makeDecoder(JsonDecoder.object<UserMutedEvent>(
  {
    channelId: uint8ArrayToStringDecoder,
    pubkey: JsonDecoder.string,
    unmute: JsonDecoder.boolean,
  },
  'UserMutedEventDecoder',
  {
    pubkey: 'PubKey',
    channelId: 'ChannelId',
    unmute: 'Unmute'
  }
));

const messageIdDecoder = uint8ArrayDecoder.map((s) => Buffer.from(s).toString('base64'))

export const messageDeletedEventDecoder = makeDecoder(JsonDecoder.object<MessageDeletedEvent>(
  {
    messageId: messageIdDecoder,
  },
  'MessageDeletedDecoder',
  {
    messageId: 'MessageId'
  }
));

export const nicknameUpdatedEventDecoder = makeDecoder(JsonDecoder.object<NicknameUpdatedEvent>(
  {
    channelId: uint8ArrayToStringDecoder,
    nickname: JsonDecoder.string,
    exists: JsonDecoder.boolean
  },
  'NicknameUpdatedEventDecoder',
  {
    channelId: 'ChannelIdBytes',
    nickname: 'Nickname',
    exists: 'Exists'
  }
));

const allowListDecoder = JsonDecoder.dictionary<AllowList>(JsonDecoder.emptyObject, 'AllowListDecoder');
const allowListsDecoder = JsonDecoder.object<AllowLists>(
  {
    allowWithoutTags: allowListDecoder,
    allowWithTags: allowListDecoder,
  },
  'AllowListsDecoder',
  {
    allowWithoutTags: 'AllowWithoutTags',
    allowWithTags: 'AllowWithTags'
  }
)

const notificationFilterDecoder = JsonDecoder.object<NotificationFilter>(
  {
    id: uint8ArrayToStringDecoder,
    channelId: uint8ArrayToStringDecoder,
    tags: JsonDecoder.array<string>(JsonDecoder.string, 'TagsDecoder'),
    allowLists: allowListsDecoder
  },
  'NotificationFilterDecoder',
  {
    id: 'Identifier',
    channelId: 'ChannelID',
    tags: 'Tags',
    allowLists: 'AllowLists'
  }
);

const notificationLevelDecoder = JsonDecoder.enumeration<NotificationLevel>(NotificationLevel, 'NotificationLevelDecoder');
const notificationStatusDecoder = JsonDecoder.enumeration<NotificationStatus>(NotificationStatus, 'NotificationStatusDecoder');
const notificationStateDecoder = JsonDecoder.object<NotificationState>(
  {
    channelId: uint8ArrayToStringDecoder,
    level: notificationLevelDecoder,
    status: notificationStatusDecoder
  },
  'NotificationStateDecoder',
  {
    channelId: 'ChannelID',
    level: 'Level',
    status: 'Status'
  }
);

export const notificationUpdateEventDecoder = makeDecoder(JsonDecoder.object<NotificationUpdateEvent>(
  {
    notificationFilters: JsonDecoder.array<NotificationFilter>(notificationFilterDecoder, 'NotificationFilterArrayDecoder'),
    changedNotificationStates: JsonDecoder.array<NotificationState>(notificationStateDecoder, 'ChangedNotificationStatesDecoder'),
    deletedNotificationStates: JsonDecoder.array<ChannelId>(uint8ArrayToStringDecoder, 'DeletedNotificationStatesDecoder'),
    maxState: JsonDecoder.number
  },
  'NotificationUpdateEventDecoder',
  {
    notificationFilters: 'NotificationFilters',
    changedNotificationStates: 'ChangedNotificationStates',
    deletedNotificationStates: 'DeletedNotificationStates',
    maxState: 'MaxState'
  }
))

export const channelFavoritesDecoder = makeDecoder(JsonDecoder.array<string>(JsonDecoder.string, 'ChannelFavoritesDecoder'))



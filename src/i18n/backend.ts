import languageCache from './cache';

type Callback = (error: string | null, data: any) => void;

type LoadResult = [string | null, Record<string, string> | boolean];

const loaders: Record<string, Promise<LoadResult>> = {};

export default class Backend {
  type = <const>'backend';

  static type = <const>'backend';

  async read(lng: string, _namespace: string, responder: Callback): Promise<void> {
    if (languageCache[lng]) {
      return responder(null, languageCache[lng]);
    }

    if (!loaders[lng]) {
      loaders[lng] = this.createLoader(lng);
    }

    const [error, data] = await loaders[lng];

    return responder(error, data);
  }

  async createLoader(lng: string): Promise<LoadResult> {
    try {
      const response = await fetch(`locales/${lng}/index.json`, { cache: 'force-cache' });

      if (!response.ok) {
        return [`i18n: failed loading ${lng}`, response.status >= 500 && response.status < 600];
      } else {
        languageCache[lng] = (await response.json()) as Record<string, string>;

        return [null, languageCache[lng]];
      }
    } catch (error) {
      return [(error as Error).message, false];
    }
  }
}

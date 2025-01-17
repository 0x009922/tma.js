import { boolean, searchParams, string } from '@tma.js/parsing';
import { initData } from '@tma.js/init-data';
import { themeParams } from '@tma.js/theme-params';

import type { LaunchParams } from './types.js';

/**
 * Returns parser used to parse launch params.
 */
export function launchParams() {
  return searchParams<LaunchParams>({
    botInline: {
      type: boolean().optional(),
      from: 'tgWebAppBotInline',
    },
    initData: {
      type: initData().optional(),
      from: 'tgWebAppData',
    },
    initDataRaw: {
      type: string().optional(),
      from: 'tgWebAppData',
    },
    platform: {
      type: string(),
      from: 'tgWebAppPlatform',
    },
    showSettings: {
      type: boolean().optional(),
      from: 'tgWebAppShowSettings',
    },
    themeParams: {
      type: themeParams(),
      from: 'tgWebAppThemeParams',
    },
    version: {
      type: string(),
      from: 'tgWebAppVersion',
    },
  }, 'LaunchParams');
}

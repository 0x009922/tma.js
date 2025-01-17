import { EventEmitter as UtilEventEmitter } from '@tma.js/event-emitter';
import { string } from '@tma.js/parsing';

import { logger } from '../globals.js';
import {
  clipboardTextReceived,
  customMethodInvoked,
  invoiceClosed,
  phoneRequested,
  popupClosed,
  qrTextReceived,
  themeChanged,
  viewportChanged,
  writeAccessRequested,
} from './parsers/index.js';
import { onTelegramEvent } from './onTelegramEvent.js';

import type { EventEmitter, EventName } from './events.js';

const CACHED_EMITTER = '__telegram-cached-emitter__';

/**
 * Returns event emitter which could be safely used, to process events from
 * Telegram native application.
 */
export function createEmitter(): EventEmitter {
  const emitter: EventEmitter = new UtilEventEmitter();
  const emit: EventEmitter['emit'] = (event: any, ...data: any[]) => {
    logger.log('Emitting processed event:', event, ...data);
    emitter.emit(event, ...data);
  };

  // Desktop version of Telegram is sometimes not sending the viewport_changed
  // event. For example, when main button is shown. That's why we should
  // add our own listener to make sure, viewport information is always fresh.
  // Issue: https://github.com/Telegram-Mini-Apps/tma.js/issues/10
  window.addEventListener('resize', () => {
    emit('viewport_changed', {
      width: window.innerWidth,
      height: window.innerHeight,
      is_state_stable: true,
      is_expanded: true,
    });
  });

  // In case, any Telegram event was received, we should prepare data before
  // passing it to emitter.
  onTelegramEvent((eventType: EventName | string, eventData): void => {
    logger.log('Received raw event:', eventType, eventData);

    try {
      switch (eventType) {
        case 'viewport_changed':
          return emit(eventType, viewportChanged().parse(eventData));

        case 'theme_changed':
          return emit(eventType, themeChanged().parse(eventData));

        case 'popup_closed':
          // FIXME: Payloads are different on different platforms.
          //  Issue: https://github.com/Telegram-Mini-Apps/tma.js/issues/2
          if (
            // Sent on desktop.
            eventData === undefined
            // Sent on iOS.
            || eventData === null
          ) {
            return emit(eventType, {});
          }
          return emit(eventType, popupClosed().parse(eventData));

        case 'set_custom_style':
          return emit(eventType, string().parse(eventData));

        case 'qr_text_received':
          return emit(eventType, qrTextReceived().parse(eventData));

        case 'clipboard_text_received':
          return emit(eventType, clipboardTextReceived().parse(eventData));

        case 'invoice_closed':
          return emit(eventType, invoiceClosed().parse(eventData));

        case 'phone_requested':
          return emit('phone_requested', phoneRequested().parse(eventData));

        case 'custom_method_invoked':
          return emit('custom_method_invoked', customMethodInvoked().parse(eventData));

        case 'write_access_requested':
          return emit('write_access_requested', writeAccessRequested().parse(eventData));

        // Events which have no parameters.
        case 'main_button_pressed':
        case 'back_button_pressed':
        case 'settings_button_pressed':
        case 'scan_qr_popup_closed':
        case 'reload_iframe':
          return emit(eventType);

        // All other event listeners will receive unknown type of data.
        default:
          return emit(eventType as any, eventData);
      }
    } catch (cause) {
      logger.error('Error processing event:', cause);
    }
  });

  return emitter;
}

/**
 * Returns singleton instance of bridge EventEmitter. Also, defines
 * Telegram event handlers.
 */
export function singletonEmitter(): EventEmitter {
  const wnd: any = window;
  const cachedEmitter = wnd[CACHED_EMITTER];

  if (cachedEmitter === undefined) {
    wnd[CACHED_EMITTER] = createEmitter();
  }

  return wnd[CACHED_EMITTER];
}

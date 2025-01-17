import { describe, it, expect } from 'vitest';

import { serializeThemeParams } from '~/theme-params/index.js';

[
  ['accent_text_color', 'accentTextColor'],
  ['bg_color', 'backgroundColor'],
  ['button_color', 'buttonColor'],
  ['button_text_color', 'buttonTextColor'],
  ['destructive_text_color', 'destructiveTextColor'],
  ['header_bg_color', 'headerBackgroundColor'],
  ['hint_color', 'hintColor'],
  ['link_color', 'linkColor'],
  ['secondary_bg_color', 'secondaryBackgroundColor'],
  ['section_header_text_color', 'sectionHeaderTextColor'],
  ['section_bg_color', 'sectionBackgroundColor'],
  ['subtitle_text_color', 'subtitleTextColor'],
  ['text_color', 'textColor'],
].forEach(([to, from]) => {
  describe(from, () => {
    it(`should omit the "${to}" property in case this property is missing`, () => {
      expect(serializeThemeParams({})).not.toMatch(`"${to}"`);
    });

    it(`should map this property to "${to}" property`, () => {
      expect(serializeThemeParams({ [from]: '#aabbcc' })).toBe(`{"${to}":"#aabbcc"}`);
    });
  });
});

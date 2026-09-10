import {
  DEFAULT_DAILY_NOTE_FORMAT,
  DEFAULT_MONTHLY_NOTE_FORMAT,
  DEFAULT_WEEKLY_NOTE_FORMAT,
  DEFAULT_QUARTERLY_NOTE_FORMAT,
  DEFAULT_YEARLY_NOTE_FORMAT,
} from "./constants";
import { IPeriodicNoteSettings } from "./types";

/**
 * Resolve the periodic-notes plugin instance, preferring a side-installed
 * dev build (id "periodic-notes-anks") over the community-store build.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function getPeriodicNotesPlugin() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pluginManager = (<any>window.app).plugins;
  // Try dev version first, then fall back to production
  return (
    pluginManager.getPlugin("periodic-notes-anks") ||
    pluginManager.getPlugin("periodic-notes")
  );
}

export function shouldUsePeriodicNotesSettings(
  periodicity: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
): boolean {
  const periodicNotes = getPeriodicNotesPlugin();
  return periodicNotes && periodicNotes.settings?.[periodicity]?.enabled;
}

/**
 * Read the user settings for the `daily-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
export function getDailyNoteSettings(): IPeriodicNoteSettings {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { internalPlugins } = <any>window.app;

    if (shouldUsePeriodicNotesSettings("daily")) {
      const { format, folder, template } =
        getPeriodicNotesPlugin()?.settings?.daily || {};
      return {
        format: format || DEFAULT_DAILY_NOTE_FORMAT,
        folder: folder?.trim() || "",
        template: template?.trim() || "",
      };
    }

    const { folder, format, template } =
      internalPlugins.getPluginById("daily-notes")?.instance?.options || {};
    return {
      format: format || DEFAULT_DAILY_NOTE_FORMAT,
      folder: folder?.trim() || "",
      template: template?.trim() || "",
    };
  } catch (err) {
    console.info("No custom daily note settings found!", err);
  }
}

/**
 * Read the user settings for the `weekly-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
export function getWeeklyNoteSettings(): IPeriodicNoteSettings {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pluginManager = (<any>window.app).plugins;

    // Try dev version first, then fall back to production
    const calendarSettings =
      pluginManager.getPlugin("calendar-anks")?.options ||
      pluginManager.getPlugin("calendar")?.options;
    const periodicNotesSettings = getPeriodicNotesPlugin()?.settings?.weekly;

    if (shouldUsePeriodicNotesSettings("weekly")) {
      return {
        format: periodicNotesSettings.format || DEFAULT_WEEKLY_NOTE_FORMAT,
        folder: periodicNotesSettings.folder?.trim() || "",
        template: periodicNotesSettings.template?.trim() || "",
        allowPrefixMatch: periodicNotesSettings.allowPrefixMatch ?? false,
      };
    }

    const settings = calendarSettings || {};
    return {
      format: settings.weeklyNoteFormat || DEFAULT_WEEKLY_NOTE_FORMAT,
      folder: settings.weeklyNoteFolder?.trim() || "",
      template: settings.weeklyNoteTemplate?.trim() || "",
      allowPrefixMatch: false, // Calendar plugin doesn't support this setting
    };
  } catch (err) {
    console.info("No custom weekly note settings found!", err);
  }
}

/**
 * Read the user settings for the `periodic-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
export function getMonthlyNoteSettings(): IPeriodicNoteSettings {
  try {
    const settings =
      (shouldUsePeriodicNotesSettings("monthly") &&
        getPeriodicNotesPlugin()?.settings?.monthly) ||
      {};

    return {
      format: settings.format || DEFAULT_MONTHLY_NOTE_FORMAT,
      folder: settings.folder?.trim() || "",
      template: settings.template?.trim() || "",
    };
  } catch (err) {
    console.info("No custom monthly note settings found!", err);
  }
}

/**
 * Read the user settings for the `periodic-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
export function getQuarterlyNoteSettings(): IPeriodicNoteSettings {
  try {
    const settings =
      (shouldUsePeriodicNotesSettings("quarterly") &&
        getPeriodicNotesPlugin()?.settings?.quarterly) ||
      {};

    return {
      format: settings.format || DEFAULT_QUARTERLY_NOTE_FORMAT,
      folder: settings.folder?.trim() || "",
      template: settings.template?.trim() || "",
    };
  } catch (err) {
    console.info("No custom quarterly note settings found!", err);
  }
}

/**
 * Read the user settings for the `periodic-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
export function getYearlyNoteSettings(): IPeriodicNoteSettings {
  try {
    const settings =
      (shouldUsePeriodicNotesSettings("yearly") &&
        getPeriodicNotesPlugin()?.settings?.yearly) ||
      {};

    return {
      format: settings.format || DEFAULT_YEARLY_NOTE_FORMAT,
      folder: settings.folder?.trim() || "",
      template: settings.template?.trim() || "",
    };
  } catch (err) {
    console.info("No custom yearly note settings found!", err);
  }
}

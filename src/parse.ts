import type { Moment } from "moment";
import { TFile } from "obsidian";

import {
  getDailyNoteSettings,
  getWeeklyNoteSettings,
  getMonthlyNoteSettings,
  getQuarterlyNoteSettings,
  getYearlyNoteSettings,
} from "./settings";

import { IGranularity } from "./types";
import { basename } from "./vault";

/**
 * dateUID is a way of weekly identifying daily/weekly/monthly notes.
 * They are prefixed with the granularity to avoid ambiguity.
 */
export function getDateUID(
  date: Moment,
  granularity: IGranularity = "day"
): string {
  const ts = date.clone().startOf(granularity).format();
  return `${granularity}-${ts}`;
}

function removeEscapedCharacters(format: string): string {
  return format.replace(/\[[^\]]*\]/g, ""); // remove everything within brackets
}

/**
 * XXX: When parsing dates that contain both week numbers and months,
 * Moment choses to ignore the week numbers. For the week dateUID, we
 * want the opposite behavior. Strip the MMM from the format to patch.
 */
function isFormatAmbiguous(format: string, granularity: IGranularity) {
  if (granularity === "week") {
    const cleanFormat = removeEscapedCharacters(format);
    return (
      /w{1,2}/i.test(cleanFormat) &&
      (/M{1,4}/.test(cleanFormat) || /D{1,4}/.test(cleanFormat))
    );
  }
  return false;
}

export function getDateFromFile(
  file: TFile,
  granularity: IGranularity
): Moment | null {
  return getDateFromFilename(file.basename, granularity);
}

export function getDateFromPath(
  path: string,
  granularity: IGranularity
): Moment | null {
  return getDateFromFilename(basename(path), granularity);
}

function getDateFromFilename(
  filename: string,
  granularity: IGranularity
): Moment | null {
  const getSettings = {
    day: getDailyNoteSettings,
    week: getWeeklyNoteSettings,
    month: getMonthlyNoteSettings,
    quarter: getQuarterlyNoteSettings,
    year: getYearlyNoteSettings,
  };

  const settings = getSettings[granularity]();
  const format = settings.format.split("/").pop();
  const allowPrefixMatch = settings.allowPrefixMatch ?? false;

  // First try exact match (strict mode) - backward compatible
  let noteDate = window.moment(filename, format, true);
  if (noteDate.isValid()) {
    // Exact match found
    if (isFormatAmbiguous(format, granularity)) {
      if (granularity === "week") {
        const cleanFormat = removeEscapedCharacters(format);
        if (/w{1,2}/i.test(cleanFormat)) {
          return window.moment(
            filename,
            // If format contains week, remove day & month formatting
            format.replace(/M{1,4}/g, "").replace(/D{1,4}/g, ""),
            false
          );
        }
      }
    }
    return noteDate;
  }

  // Only try prefix matching if the setting is enabled
  if (!allowPrefixMatch) {
    return null;
  }

  // Try prefix matching (non-strict mode)
  // This allows filenames like "2026-W07, 09.02 - 15.02" to match format "gggg-[W]ww"
  noteDate = window.moment(filename, format, false);
  if (noteDate.isValid()) {
    // Verify the formatted date matches the start of the filename
    const formattedDate = noteDate.format(format);
    if (filename.startsWith(formattedDate)) {
      return noteDate;
    }
  }
  return null;
}

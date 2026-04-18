// Feature: settings-timeframe
import type { Scope } from "../types/system-timeframe";

export type PickerType = "faculty" | "department" | "program" | "level" | "student";

export type ScopePickerConfig =
  | { showPicker: false; referenceId: null }
  | { showPicker: true; pickerType: PickerType };

export function getScopePickerConfig(scope: Scope): ScopePickerConfig {
  switch (scope) {
    case "GLOBAL":
      return { showPicker: false, referenceId: null };
    case "FACULTY":
      return { showPicker: true, pickerType: "faculty" };
    case "DEPARTMENT":
      return { showPicker: true, pickerType: "department" };
    case "PROGRAM":
      return { showPicker: true, pickerType: "program" };
    case "LEVEL":
      return { showPicker: true, pickerType: "level" };
    case "STUDENT":
      return { showPicker: true, pickerType: "student" };
  }
}

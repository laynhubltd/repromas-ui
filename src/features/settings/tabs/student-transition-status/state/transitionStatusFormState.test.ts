import { describe, expect, it } from "vitest";
import {
  TransitionStatusFormActionType,
  initialTransitionStatusFormState,
  transitionStatusFormReducer,
} from "./transitionStatusFormState";

describe("transitionStatusFormReducer", () => {
  it("sets isDefault", () => {
    const next = transitionStatusFormReducer(initialTransitionStatusFormState, {
      type: TransitionStatusFormActionType.SetIsDefault,
      value: true,
    });
    expect(next.isDefault).toBe(true);
  });

  it("resets to initial state", () => {
    const modified = transitionStatusFormReducer(
      initialTransitionStatusFormState,
      {
        type: TransitionStatusFormActionType.SetIsDefault,
        value: true,
      },
    );
    const reset = transitionStatusFormReducer(modified, {
      type: TransitionStatusFormActionType.Reset,
    });
    expect(reset).toEqual(initialTransitionStatusFormState);
  });
});

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { FETCH_TIMEOUT_MS } from "../../config/quizConfig";
import { clearQuizDataCache, useQuizData } from "../useQuizData";

const config = {
  dataPath: "/data/test.geojson",
  idProperty: "id",
  nameProperties: { en: "name_en", el: "name_el" },
};

const geoJson = {
  features: [{ properties: { id: "1", name_en: "Attica", name_el: "Αττική" } }],
};

const respondWith = (body, ok = true) => ({
  ok,
  status: ok ? 200 : 404,
  json: async () => body,
});

// Never resolves on its own and rejects when aborted, like a stalled download.
const stalledFetch = (_url, { signal }) =>
  new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () =>
      reject(new DOMException("Aborted", "AbortError"))
    );
  });

beforeEach(() => {
  clearQuizDataCache();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useQuizData", () => {
  it("loads and transforms the data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => respondWith(geoJson))
    );
    const { result } = renderHook(() => useQuizData(config));
    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.regionsData).toEqual([
      { id: "1", nameEng: "Attica", nameGr: "Αττική" },
    ]);
    expect(result.current.errorKey).toBeNull();
  });

  it("only fetches a file once per visit", async () => {
    const fetchMock = vi.fn(async () => respondWith(geoJson));
    vi.stubGlobal("fetch", fetchMock);

    const first = renderHook(() => useQuizData(config));
    await waitFor(() => expect(first.result.current.loading).toBe(false));
    first.unmount();

    const second = renderHook(() => useQuizData(config));
    expect(second.result.current.loading).toBe(false);
    expect(second.result.current.regionsData).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reports a failed response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => respondWith(null, false))
    );
    const { result } = renderHook(() => useQuizData(config));

    await waitFor(() => expect(result.current.errorKey).toBe("fetchFailed"));
    expect(result.current.loading).toBe(false);
  });

  it("reports invalid data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => respondWith({ features: [{ properties: {} }] }))
    );
    const { result } = renderHook(() => useQuizData(config));

    await waitFor(() => expect(result.current.errorKey).toBe("fetchFailed"));
  });

  it("reports a timeout", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn(stalledFetch));
    const { result } = renderHook(() => useQuizData(config));

    await act(() => vi.advanceTimersByTimeAsync(FETCH_TIMEOUT_MS));
    expect(result.current.errorKey).toBe("fetchTimeout");
  });

  it("does not report an error when leaving during a load", async () => {
    vi.stubGlobal("fetch", vi.fn(stalledFetch));
    const { result, unmount } = renderHook(() => useQuizData(config));
    unmount();
    await act(async () => {});

    expect(result.current.errorKey).toBeNull();
    expect(console.error).not.toHaveBeenCalled();
  });
});

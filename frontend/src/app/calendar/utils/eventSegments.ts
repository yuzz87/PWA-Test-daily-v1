import type { CalendarEvent } from "../types";

export type EventSegment = {
  event: CalendarEvent;
  startIndex: number;
  endIndex: number;
  lane: number;
  showTitle: boolean;
};

// イベントの開始日・終了日を YYYY-MM-DD 形式で取得する
export function getEventDateRange(event: CalendarEvent) {
  return {
    startDateString: event.start_at.slice(0, 10),
    endDateString: (event.end_at || event.start_at).slice(0, 10),
  };
}

// 開始日と終了日が異なる場合は複数日イベントとして扱う
export function isMultiDayEvent(event: CalendarEvent) {
  const { startDateString, endDateString } = getEventDateRange(event);

  return startDateString !== endDateString;
}

// イベントをカレンダー上で描画しやすい形式に変換する
export function createEventSegments(
  dateStrings: Array<string | null>,
  events: CalendarEvent[]
) {
  // 先頭の空白セルを除いた、最初の表示日付の位置
  const firstVisibleDateIndex = dateStrings.findIndex(Boolean);

  const rawSegments = events
    .map((event) => {
      const { startDateString, endDateString } = getEventDateRange(event);

      // 表示範囲内で、このイベントに該当する日付セルの index を集める
      const indexes = dateStrings
        .map((dateString, index) =>
          dateString &&
          startDateString <= dateString &&
          dateString <= endDateString
            ? index
            : -1
        )
        .filter((index) => index >= 0);

      // 表示範囲外のイベントは除外する
      if (indexes.length === 0) return null;

      const startIndex = indexes[0];
      const endIndex = indexes[indexes.length - 1];

      return {
        event,
        startIndex,
        endIndex,
        lane: 0,

        // 表示範囲の途中から見えるイベントでも、先頭位置にはタイトルを出す
        showTitle:
          dateStrings[startIndex] === startDateString ||
          startIndex === 0 ||
          startIndex === firstVisibleDateIndex,
      };
    })
    .filter((segment): segment is EventSegment => Boolean(segment))
    .sort((a, b) => {
      // 開始位置が早い順。同じ開始位置なら長いイベントを先にする
      if (a.startIndex !== b.startIndex) return a.startIndex - b.startIndex;
      return b.endIndex - b.startIndex - (a.endIndex - a.startIndex);
    });

  // 各 lane の最後の endIndex を保持し、重ならない lane を探す
  const laneEndIndexes: number[] = [];

  return rawSegments.map((segment) => {
    const lane = laneEndIndexes.findIndex(
      (endIndex) => endIndex < segment.startIndex
    );
    const nextLane = lane >= 0 ? lane : laneEndIndexes.length;

    laneEndIndexes[nextLane] = segment.endIndex;

    return {
      ...segment,
      lane: nextLane,
    };
  });
}

// 表示に必要な lane 数を返す
export function getSegmentLaneCount(segments: EventSegment[]) {
  return segments.length > 0
    ? Math.max(...segments.map((segment) => segment.lane)) + 1
    : 0;
}
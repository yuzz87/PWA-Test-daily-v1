"use client";

import { useEffect, useRef, useState } from "react";
import type { CalendarEvent } from "../../types";
import {
  createEventSegments,
  getSegmentLaneCount,
  isMultiDayEvent,
} from "../../utils/eventSegments";
import { formatDate } from "../../utils/date";
import WeekCalendarColumn from "./WeekCalendarColumn";
import WeekHeader from "./WeekHeader";
import WeekTimeGrid from "./WeekTimeGrid";
import { HOUR_HEIGHT } from "./timeGrid";

// 週表示カレンダーで受け取るpropsの型
type WeekCalendarViewProps = {
  // 選択中の日付
  selectedDate: string;

  // 表示する日数
  // 省略時は7日表示
  dayCount?: number;

  // 予定一覧
  events: CalendarEvent[];

  // 祝日情報
  holidayMap: Map<string, string>;

  // 今日の日付文字列
  todayString: string;

  // 編集中の予定ID
  editingEventId: number | null;

  // 日付をクリックしたときの処理
  onDateClick: (dateString: string) => void;

  // 予定をクリックしたときの処理
  onEventClick: (event: CalendarEvent) => void;
};

// 日付ヘッダー部分の高さ
const DAY_HEADER_HEIGHT = 44;

// 終日・複数日予定バーの高さ
const EVENT_BAR_HEIGHT = 22;

// 予定バー同士の余白
const EVENT_BAR_GAP = 4;

// 表示する日付一覧を作る
function getDisplayDays(baseDateString: string, dayCount: number) {
  const baseDate = baseDateString ? new Date(baseDateString) : new Date();
  const startDate = new Date(baseDate);

  // 7日表示の場合は、その週の日曜日から表示する
  if (dayCount === 7) {
    startDate.setDate(baseDate.getDate() - baseDate.getDay());
  }

  return Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(startDate);

    // 開始日からindex日分進める
    date.setDate(startDate.getDate() + index);

    return {
      dateString: formatDate(date.getFullYear(), date.getMonth(), date.getDate()),
      day: date.getDate(),
      weekDay: date.getDay(),
    };
  });
}

// 左側に表示する時刻ラベル
const TIME_LABELS = Array.from(
  { length: 24 },
  (_, hour) => `${String(hour).padStart(2, "0")}:00`
);

// 現在時刻を「0時からの経過分」で返す
function getNowMinutes(): number {
  const now = new Date();

  return now.getHours() * 60 + now.getMinutes();
}

// 週表示・日表示のカレンダー画面
export default function WeekCalendarView({
  selectedDate,
  dayCount = 7,
  events,
  holidayMap,
  todayString,
  editingEventId,
  onDateClick,
  onEventClick,
}: WeekCalendarViewProps) {
  // スクロール位置を操作するためのref
  const scrollRef = useRef<HTMLDivElement>(null);

  // 現在時刻の分数
  const [nowMinutes, setNowMinutes] = useState(getNowMinutes);

  // 初回表示時に現在時刻付近へスクロールする
  useEffect(() => {
    if (scrollRef.current) {
      const nowTop = (nowMinutes / 60) * HOUR_HEIGHT;

      // 現在時刻より少し上の位置を表示する
      scrollRef.current.scrollTop = Math.max(0, nowTop - 200);
    }

    // 初回だけ実行したいため依存配列は空
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 1時間ごとに現在時刻を更新する
  useEffect(() => {
    const id = setInterval(() => setNowMinutes(getNowMinutes()), 3_600_000);

    // コンポーネント破棄時にタイマーを解除する
    return () => clearInterval(id);
  }, []);

  // 表示する日付一覧
  const weekDays = getDisplayDays(selectedDate || todayString, dayCount);

  // 複数日にまたがる予定だけをバー表示用に変換する
  const weekEventSegments = createEventSegments(
    weekDays.map((weekDay) => weekDay.dateString),
    events.filter(isMultiDayEvent)
  );

  // 複数日予定バーが何段必要か
  const laneCount = getSegmentLaneCount(weekEventSegments);

  // ヘッダー全体の高さ
  const headerHeight =
    DAY_HEADER_HEIGHT + laneCount * (EVENT_BAR_HEIGHT + EVENT_BAR_GAP);

  // 日付ごとに通常予定をまとめる
  const eventMap = new Map<string, CalendarEvent[]>();

  events.forEach((event) => {
    // 複数日予定は上部バーで表示するため除外
    if (isMultiDayEvent(event)) return;

    // start_at の先頭10文字を日付として使う
    // 例: 2026-06-05T09:00:00+09:00 → 2026-06-05
    const dateString = event.start_at.slice(0, 10);

    if (!eventMap.has(dateString)) {
      eventMap.set(dateString, []);
    }

    eventMap.get(dateString)?.push(event);
  });

  // 今日が表示範囲内にあるか
  const todayInView = weekDays.some((d) => d.dateString === todayString);

  // 現在時刻ラインの表示位置
  const nowTop = (nowMinutes / 60) * HOUR_HEIGHT;

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto rounded-lg border bg-white">
      <div
        className="grid"
        style={{
          // 左の時刻列 + 日付列
          gridTemplateColumns: `52px repeat(${dayCount}, minmax(96px, 1fr))`,

          // 画面が狭いときは横スクロールできるようにする
          minWidth: `${64 + dayCount * 110}px`,
        }}
      >
        {/* 左側の時刻列 */}
        <div className="border-r bg-gray-50">
          <div
            className="sticky top-0 z-20 border-b bg-gray-50"
            style={{ height: headerHeight }}
          />

          <WeekTimeGrid labels={TIME_LABELS} />
        </div>

        {/* 右側の日付列エリア */}
        <div
          className="col-span-full col-start-2"
          style={{ gridColumn: `2 / span ${dayCount}` }}
        >
          {/* 日付ヘッダーと複数日予定バー */}
          <WeekHeader
            weekDays={weekDays}
            holidayMap={holidayMap}
            todayString={todayString}
            dayCount={dayCount}
            headerHeight={headerHeight}
            segments={weekEventSegments}
            editingEventId={editingEventId}
            dayHeaderHeight={DAY_HEADER_HEIGHT}
            eventBarHeight={EVENT_BAR_HEIGHT}
            eventBarGap={EVENT_BAR_GAP}
            onDateClick={onDateClick}
            onEventClick={onEventClick}
          />

          {/* 時間ごとの予定表示エリア */}
          <div
            className="relative grid"
            style={{
              gridTemplateColumns: `repeat(${dayCount}, minmax(96px, 1fr))`,
            }}
          >
            {/* 日付ごとに1列ずつ表示する */}
            {weekDays.map((weekDay) => (
              <WeekCalendarColumn
                key={weekDay.dateString}
                events={eventMap.get(weekDay.dateString) || []}
                editingEventId={editingEventId}
                onEventClick={onEventClick}
              />
            ))}

            {/* 今日が表示範囲内なら現在時刻ラインを表示する */}
            {todayInView && (
              <div
                className="pointer-events-none absolute inset-x-0 z-10 flex items-center"
                style={{ top: nowTop }}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" />
                <div className="h-px flex-1 bg-red-400" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
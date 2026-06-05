import type { CalendarEvent } from "../../types";
import type { EventSegment } from "../../utils/eventSegments";
import DayHeaderCell from "../shared/DayHeaderCell";
import WeekAllDayBars from "./WeekAllDayBars";

// 週表示で使う1日分の日付情報
type WeekDay = {
  // 日付文字列
  dateString: string;

  // 日にち
  day: number;

  // 曜日
  // 0 = 日曜, 6 = 土曜
  weekDay: number;
};

// 週表示ヘッダーで使うpropsの型
type WeekHeaderProps = {
  // 表示する日付一覧
  weekDays: WeekDay[];

  // 祝日情報
  holidayMap: Map<string, string>;

  // 今日の日付文字列
  todayString: string;

  // 表示する日数
  dayCount: number;

  // ヘッダー全体の高さ
  headerHeight: number;

  // 終日・複数日予定バーの情報
  segments: EventSegment[];

  // 編集中の予定ID
  editingEventId: number | null;

  // 日付ヘッダー部分の高さ
  dayHeaderHeight: number;

  // 予定バーの高さ
  eventBarHeight: number;

  // 予定バー同士の余白
  eventBarGap: number;

  // 日付をクリックしたときの処理
  onDateClick: (dateString: string) => void;

  // 予定をクリックしたときの処理
  onEventClick: (event: CalendarEvent) => void;
};

// 週表示の上部ヘッダー
export default function WeekHeader({
  weekDays,
  holidayMap,
  todayString,
  dayCount,
  headerHeight,
  segments,
  editingEventId,
  dayHeaderHeight,
  eventBarHeight,
  eventBarGap,
  onDateClick,
  onEventClick,
}: WeekHeaderProps) {
  return (
    <div
      className="sticky top-0 z-20 border-b bg-white"
      style={{
        // 日付ヘッダー + 終日予定バー分の高さ
        height: headerHeight,
      }}
    >
      {/* 日付・曜日を表示する行 */}
      <div
        className="grid"
        style={{
          // dayCountの数だけ列を作る
          gridTemplateColumns: `repeat(${dayCount}, minmax(96px, 1fr))`,

          // 日付ヘッダー部分の高さ
          height: dayHeaderHeight,
        }}
      >
        {weekDays.map((weekDay) => (
          <DayHeaderCell
            key={weekDay.dateString}
            dateString={weekDay.dateString}
            day={weekDay.day}
            weekDay={weekDay.weekDay}
            holidayName={holidayMap.get(weekDay.dateString)}
            todayString={todayString}
            variant="week"
            onDateClick={onDateClick}
          />
        ))}
      </div>

      {/* 終日・複数日予定バーを表示するエリア */}
      <div
        className="relative"
        style={{
          // ヘッダー全体から日付行の高さを引いた残り
          height: headerHeight - dayHeaderHeight,
        }}
      >
        <WeekAllDayBars
          segments={segments}
          dayCount={dayCount}
          editingEventId={editingEventId}
          eventBarHeight={eventBarHeight}
          eventBarGap={eventBarGap}
          onEventClick={onEventClick}
        />
      </div>
    </div>
  );
}
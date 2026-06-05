import type { CalendarEvent } from "../../types";
import { DAY_HEIGHT, HOUR_HEIGHT } from "./timeGrid";
import WeekEventBlock from "./WeekEventBlock";

// 週表示の1日分の列で使うpropsの型
type WeekCalendarColumnProps = {
  // この日に表示する予定一覧
  events: CalendarEvent[];

  // 編集中の予定ID
  editingEventId: number | null;

  // 予定をクリックしたときの処理
  onEventClick: (event: CalendarEvent) => void;
};

// 予定の最低表示高さ
const MIN_EVENT_HEIGHT = 24;

// その日の開始時刻から何分経過しているかを計算する
function getMinutesFromDayStart(dateTime: string) {
  const date = new Date(dateTime);

  return date.getHours() * 60 + date.getMinutes();
}

// 予定をどの位置・高さで表示するか計算する
function getEventLayout(event: CalendarEvent) {
  // 終日予定の場合は上部に固定表示する
  if (event.all_day) {
    return {
      top: 2,
      height: MIN_EVENT_HEIGHT,
    };
  }

  // 開始時刻を分に変換する
  const startMinutes = getMinutesFromDayStart(event.start_at);

  // 終了時刻がない場合は30分予定として扱う
  const endMinutes = event.end_at
    ? getMinutesFromDayStart(event.end_at)
    : startMinutes + 30;

  // 最低でも15分の予定として扱う
  const durationMinutes = Math.max(endMinutes - startMinutes, 15);

  return {
    // 開始時刻に応じて上からの位置を決める
    top: (startMinutes / 60) * HOUR_HEIGHT,

    // 予定時間に応じて高さを決める
    height: Math.max((durationMinutes / 60) * HOUR_HEIGHT, MIN_EVENT_HEIGHT),
  };
}

// 週表示の1日分のカレンダー列
export default function WeekCalendarColumn({
  events,
  editingEventId,
  onEventClick,
}: WeekCalendarColumnProps) {
  return (
    <div
      className="relative border-r bg-[linear-gradient(to_bottom,transparent_39px,#e5e7eb_40px)] bg-[length:100%_40px]"
      style={{ minHeight: DAY_HEIGHT }}
    >
      {/* この日にある予定を表示する */}
      {events.map((event) => {
        // 予定の表示位置と高さを計算する
        const layout = getEventLayout(event);

        return (
          <WeekEventBlock
            key={event.id}
            event={event}
            isEditing={editingEventId === event.id}
            style={{
              // 少し下にずらして、枠線と重ならないようにする
              top: layout.top + 2,

              // 左右に余白を作る
              left: 6,
              right: 6,

              // 少し小さくして上下に余白を作る
              height: layout.height - 4,
            }}
            onClick={onEventClick}
          />
        );
      })}
    </div>
  );
}
import type { CSSProperties } from "react";

import type { CalendarEvent } from "../../types";
import { formatTime } from "../../utils/date";

// 週表示の予定ブロックで使うpropsの型
type WeekEventBlockProps = {
  // 表示する予定データ
  event: CalendarEvent;

  // 編集中の予定かどうか
  isEditing?: boolean;

  // 表示位置やサイズ
  style?: CSSProperties;

  // クリック時の処理
  onClick: (event: CalendarEvent) => void;
};

// 週表示の予定ブロック
export default function WeekEventBlock({
  event,
  isEditing = false,
  style,
  onClick,
}: WeekEventBlockProps) {
  return (
    <button
      type="button"
      // クリックされた予定を親コンポーネントへ渡す
      onClick={() => onClick(event)}
      className={`absolute overflow-hidden rounded px-2 py-1.5 text-left text-xs text-white opacity-90 hover:opacity-100 ${
        // 編集中の予定なら枠線を付ける
        isEditing ? "ring-2 ring-gray-800" : ""
      }`}
      // 予定の色を背景色に使う
      // styleにはtop, left, right, heightなどが入る
      style={{ backgroundColor: event.color || "#3b82f6", ...style }}
      // マウスを乗せたときに説明またはタイトルを表示する
      title={event.description || event.title}
    >
      {/* 予定名 */}
      <span className="block truncate font-medium">{event.title}</span>

      {/* 終日予定なら「終日」、通常予定なら開始時刻を表示 */}
      <span className="block truncate text-[10px] opacity-90">
        {event.all_day ? "終日" : formatTime(event.start_at)}
      </span>
    </button>
  );
}
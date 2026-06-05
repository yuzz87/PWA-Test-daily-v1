import type { CalendarEvent } from "../../types";
import type { EventSegment } from "../../utils/eventSegments";
import EventBar from "../shared/EventBar";

// 週表示の終日予定バーで使うpropsの型
type WeekAllDayBarsProps = {
  // 表示する予定バーの情報一覧
  segments: EventSegment[];

  // 表示する日数
  // 週表示なら基本は7日
  dayCount: number;

  // 編集中の予定ID
  editingEventId: number | null;

  // 予定バーの高さ
  eventBarHeight: number;

  // 予定バー同士の余白
  eventBarGap: number;

  // 予定バーをクリックしたときの処理
  onEventClick: (event: CalendarEvent) => void;
};

// 週表示の終日予定バーを表示するコンポーネント
export default function WeekAllDayBars({
  segments,
  dayCount,
  editingEventId,
  eventBarHeight,
  eventBarGap,
  onEventClick,
}: WeekAllDayBarsProps) {
  return (
    <>
      {/* 終日予定の数だけ予定バーを表示する */}
      {segments.map((segment) => {
        // lane は何段目に表示するかを表す
        // 段数に応じて上からの位置をずらす
        const top = segment.lane * (eventBarHeight + eventBarGap);

        return (
          <EventBar
            key={`${segment.event.id}-${segment.startIndex}`}
            segment={segment}
            dayCount={dayCount}
            top={top}
            height={eventBarHeight}
            isEditing={editingEventId === segment.event.id}
            className=""
            onEventClick={onEventClick}
          />
        );
      })}
    </>
  );
}
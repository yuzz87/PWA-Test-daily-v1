import { DAY_HEIGHT, HOUR_HEIGHT } from "./timeGrid";

// 時刻表示グリッドで使うpropsの型
type WeekTimeGridProps = {
  // 左側に表示する時刻ラベル一覧
  labels: string[];
};

// 週表示・日表示の左側にある時刻ラベル
export default function WeekTimeGrid({ labels }: WeekTimeGridProps) {
  return (
    <div style={{ minHeight: DAY_HEIGHT }}>
      {/* 1時間ごとに時刻ラベルを表示する */}
      {labels.map((time) => (
        <div
          key={time}
          className="border-b px-2 pt-0.5 text-right text-[11px] text-gray-500"
          // 1時間分の高さを指定する
          style={{ height: HOUR_HEIGHT }}
        >
          {time}
        </div>
      ))}
    </div>
  );
}
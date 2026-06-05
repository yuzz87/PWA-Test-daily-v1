import { useMemo } from "react";

import type { CalendarEvent } from "../types";

// 検索キーワードに一致する予定だけを返すカスタムフック
export function useFilteredEvents(
  events: CalendarEvent[],
  searchKeyword: string
) {
  // events または searchKeyword が変わったときだけ再計算する
  return useMemo(() => {
    // 前後の空白を削除し、小文字に変換する
    const keyword = searchKeyword.trim().toLowerCase();

    // 検索キーワードが空なら、すべての予定を返す
    if (!keyword) {
      return events;
    }

    // タイトルまたは説明文にキーワードが含まれる予定だけを残す
    return events.filter((event) => {
      const title = event.title.toLowerCase();

      // description がない場合は空文字として扱う
      const description = event.description?.toLowerCase() || "";

      return title.includes(keyword) || description.includes(keyword);
    });
  }, [events, searchKeyword]);
}
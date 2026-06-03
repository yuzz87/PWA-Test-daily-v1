import { useEffect, useMemo, useState } from "react";

import { fetchEvents, fetchHolidays } from "../api";
import type { CalendarEvent, Holiday } from "../types";

export function useCalendarEvents(currentYear: number, currentMonth: number) {
  // 祝日一覧を管理
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  // 予定一覧を管理
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // 日付をキーにして祝日名を取得できる形に変換
  const holidayMap = useMemo(() => {
    const map = new Map<string, string>();

    holidays.forEach((holiday) => {
      map.set(holiday.date, holiday.name);
    });

    return map;
  }, [holidays]);

  // 表示中の年月に対応する祝日を取得
  useEffect(() => {
    async function loadHolidays() {
      try {
        // currentMonth は 0 始まりなので、API 用に +1 する
        const data = await fetchHolidays(currentYear, currentMonth + 1);
        setHolidays(data);
      } catch (error) {
        console.error(error);

        // 取得に失敗した場合は空配列にする
        setHolidays([]);
      }
    }

    loadHolidays();
  }, [currentYear, currentMonth]);

  // 表示中の年月に対応する予定を取得
  useEffect(() => {
    async function loadEvents() {
      try {
        // currentMonth は 0 始まりなので、API 用に +1 する
        const data = await fetchEvents(currentYear, currentMonth + 1);
        setEvents(data);
      } catch (error) {
        console.error(error);

        // 取得に失敗した場合は空配列にする
        setEvents([]);
      }
    }

    loadEvents();
  }, [currentYear, currentMonth]);

  // カレンダー画面で使用する値を返す
  return {
    events,
    setEvents,
    holidayMap,
  };
}
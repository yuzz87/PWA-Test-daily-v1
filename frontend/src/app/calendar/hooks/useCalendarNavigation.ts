import { useMemo, useState } from "react";

import { createCalendarDays, formatDate } from "../utils/date";

// カレンダーの日付移動を管理するカスタムフック
export function useCalendarNavigation(today: Date) {
  // 表示中の年
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // 表示中の月
  // JavaScriptの月は 0始まり
  // 例: 0 = 1月, 11 = 12月
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());

  // 選択中の日付
  const [selectedDate, setSelectedDate] = useState(() =>
    formatDate(today.getFullYear(), today.getMonth(), today.getDate())
  );

  // 今日の日付文字列
  const todayString = formatDate(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  // 表示中の年月に対応するカレンダー日付一覧
  // currentYear / currentMonth が変わったときだけ再計算する
  const calendarDays = useMemo(() => {
    return createCalendarDays(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // 指定した日付を選択する
  function selectDate(dateString: string) {
    const date = new Date(dateString);

    setSelectedDate(dateString);
    setCurrentYear(date.getFullYear());
    setCurrentMonth(date.getMonth());
  }

  // 前の月へ移動する
  function goToPrevMonth() {
    const newDate = new Date(currentYear, currentMonth - 1, 1);

    setCurrentYear(newDate.getFullYear());
    setCurrentMonth(newDate.getMonth());

    // 移動先の月の1日を選択する
    setSelectedDate(formatDate(newDate.getFullYear(), newDate.getMonth(), 1));
  }

  // 次の月へ移動する
  function goToNextMonth() {
    const newDate = new Date(currentYear, currentMonth + 1, 1);

    setCurrentYear(newDate.getFullYear());
    setCurrentMonth(newDate.getMonth());

    // 移動先の月の1日を選択する
    setSelectedDate(formatDate(newDate.getFullYear(), newDate.getMonth(), 1));
  }

  // 今日の日付へ移動する
  function goToToday() {
    const now = new Date();

    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(formatDate(now.getFullYear(), now.getMonth(), now.getDate()));
  }

  // 選択中の日付を指定日数だけ移動する
  function moveSelectedDate(offset: number) {
    // selectedDate がない場合は今日を基準にする
    const date = new Date(selectedDate || todayString);

    // offset日分ずらす
    date.setDate(date.getDate() + offset);

    // 移動後の日付を選択する
    selectDate(formatDate(date.getFullYear(), date.getMonth(), date.getDate()));
  }

  // 前の週へ移動する
  function goToPrevWeek() {
    moveSelectedDate(-7);
  }

  // 次の週へ移動する
  function goToNextWeek() {
    moveSelectedDate(7);
  }

  // 前の年へ移動する
  function goToPrevYear() {
    const newYear = currentYear - 1;

    setCurrentYear(newYear);

    // 移動先の年・現在の月の1日を選択する
    setSelectedDate(formatDate(newYear, currentMonth, 1));
  }

  // 次の年へ移動する
  function goToNextYear() {
    const newYear = currentYear + 1;

    setCurrentYear(newYear);

    // 移動先の年・現在の月の1日を選択する
    setSelectedDate(formatDate(newYear, currentMonth, 1));
  }

  // コンポーネント側で使う値と関数を返す
  return {
    currentYear,
    currentMonth,
    selectedDate,
    todayString,
    calendarDays,
    setCurrentMonth,
    setSelectedDate,
    selectDate,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    moveSelectedDate,
    goToPrevWeek,
    goToNextWeek,
    goToPrevYear,
    goToNextYear,
  };
}
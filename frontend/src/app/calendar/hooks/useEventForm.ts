import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";

import {
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
} from "../api";
import type { CalendarEvent } from "../types";
import { formatDateFromDateTime, formatTime } from "../utils/date";

// エラー内容を安全に取り出す関数
function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

// このフックが受け取るpropsの型
type UseEventFormProps = {
  selectedDate: string;
  setSelectedDate: (value: string) => void;
  setEvents: Dispatch<SetStateAction<CalendarEvent[]>>;
};

// 予定作成・編集・削除フォームを管理するカスタムフック
export function useEventForm({
  selectedDate,
  setSelectedDate,
  setEvents,
}: UseEventFormProps) {
  // 予定名
  const [eventTitle, setEventTitle] = useState("");

  // 予定の説明
  const [eventDescription, setEventDescription] = useState("");

  // 開始時刻
  const [eventStartTime, setEventStartTime] = useState("09:00");

  // 終了日
  const [eventEndDate, setEventEndDate] = useState(selectedDate);

  // 終了時刻
  const [eventEndTime, setEventEndTime] = useState("10:00");

  // 終日予定かどうか
  const [eventAllDay, setEventAllDay] = useState(false);

  // 予定の色
  const [eventColor, setEventColor] = useState("#3b82f6");

  // 編集中の予定ID
  // null の場合は新規作成
  const [editingEventId, setEditingEventId] = useState<number | null>(null);

  // モーダルを開いているか
  const [isModalOpen, setIsModalOpen] = useState(false);

  // エラーメッセージ
  const [errorMessage, setErrorMessage] = useState("");

  // 作成・更新中かどうか
  const [submitting, setSubmitting] = useState(false);

  // 削除中かどうか
  const [deleting, setDeleting] = useState(false);

  // フォームを初期状態に戻す
  function resetEventForm(dateString = selectedDate) {
    setEditingEventId(null);
    setEventTitle("");
    setEventDescription("");
    setEventStartTime("09:00");
    setEventEndDate(dateString);
    setEventEndTime("10:00");
    setEventAllDay(false);
    setEventColor("#aecbfa");
  }

  // モーダルを閉じる
  function closeModal() {
    setIsModalOpen(false);
    setErrorMessage("");
    setSubmitting(false);
    setDeleting(false);
    resetEventForm();
  }

  // 新規作成モーダルを開く
  function openCreateModal(dateString: string) {
    resetEventForm(dateString);
    setErrorMessage("");
    setSubmitting(false);
    setDeleting(false);
    setSelectedDate(dateString);
    setEventEndDate(dateString);
    setIsModalOpen(true);
  }

  // 既存の予定を編集モードで開く
  function startEditEvent(event: CalendarEvent) {
    setErrorMessage("");
    setSubmitting(false);
    setDeleting(false);

    // 編集対象のIDを保存
    setEditingEventId(event.id);

    // 既存の予定データをフォームに入れる
    setEventTitle(event.title);
    setEventDescription(event.description || "");
    setSelectedDate(formatDateFromDateTime(event.start_at));
    setEventEndDate(formatDateFromDateTime(event.end_at || event.start_at));
    setEventAllDay(event.all_day);
    setEventColor(event.color || "#3b82f6");

    // 終日予定の場合は時刻を初期値にする
    if (event.all_day) {
      setEventStartTime("09:00");
      setEventEndTime("10:00");
      setIsModalOpen(true);
      return;
    }

    // 通常予定の場合は開始・終了時刻をセットする
    setEventStartTime(formatTime(event.start_at));
    setEventEndTime(event.end_at ? formatTime(event.end_at) : formatTime(event.start_at));
    setIsModalOpen(true);
  }

  // 入力内容をチェックする
  function validateEventForm() {
    if (!selectedDate || !eventEndDate || !eventTitle.trim()) {
      setErrorMessage("日付と予定名を入力してください");
      return false;
    }

    // 終了日時が開始日時より前、または同じ場合はエラー
    if (
      (eventAllDay && eventEndDate < selectedDate) ||
      (!eventAllDay &&
        `${eventEndDate}T${eventEndTime}` <= `${selectedDate}T${eventStartTime}`)
    ) {
      setErrorMessage("終了時刻は開始時刻より後にしてください");
      return false;
    }

    return true;
  }

  // APIに送るデータを作る
  function buildPayload() {
    const startAt = eventAllDay
      ? `${selectedDate}T00:00:00+09:00`
      : `${selectedDate}T${eventStartTime}:00+09:00`;

    const endAt = eventAllDay
      ? `${eventEndDate}T23:59:59+09:00`
      : `${eventEndDate}T${eventEndTime}:00+09:00`;

    return {
      title: eventTitle,
      description: eventDescription,
      start_at: startAt,
      end_at: endAt,
      all_day: eventAllDay,
      color: eventColor,
    };
  }

  // 予定を新規作成する
  async function createEvent() {
    setErrorMessage("");

    // 二重送信や入力エラーを防ぐ
    if (submitting || !validateEventForm()) return;

    setSubmitting(true);

    try {
      const newEvent = await createCalendarEvent(buildPayload());

      // 作成した予定を一覧に追加する
      setEvents((prev) => [...prev, newEvent]);

      closeModal();
    } catch (error) {
      console.error(error);
      setErrorMessage(getErrorMessage(error, "予定の作成に失敗しました"));
    } finally {
      setSubmitting(false);
    }
  }

  // 予定を更新する
  async function updateEvent() {
    setErrorMessage("");

    // 編集対象がない場合や入力エラーの場合は中断
    if (submitting || !editingEventId || !validateEventForm()) return;

    setSubmitting(true);

    try {
      const updatedEvent = await updateCalendarEvent(editingEventId, buildPayload());

      // 一覧の中から該当する予定だけ差し替える
      setEvents((prev) =>
        prev.map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );

      closeModal();
    } catch (error) {
      console.error(error);
      setErrorMessage(getErrorMessage(error, "予定の更新に失敗しました"));
    } finally {
      setSubmitting(false);
    }
  }

  // 予定を削除する
  async function deleteEvent(id: number) {
    const ok = confirm("この予定を削除しますか？");

    // キャンセルされた場合や削除中の場合は中断
    if (!ok || deleting) return;

    setErrorMessage("");
    setDeleting(true);

    try {
      await deleteCalendarEvent(id);

      // 削除した予定を一覧から取り除く
      setEvents((prev) => prev.filter((event) => event.id !== id));

      // 編集中の予定を削除した場合はモーダルを閉じる
      if (editingEventId === id) {
        closeModal();
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(getErrorMessage(error, "予定の削除に失敗しました"));
    } finally {
      setDeleting(false);
    }
  }

  // コンポーネント側で使う値と関数を返す
  return {
    eventTitle,
    eventDescription,
    eventStartTime,
    eventEndDate,
    eventEndTime,
    eventAllDay,
    eventColor,
    editingEventId,
    isModalOpen,
    errorMessage,
    submitting,
    deleting,
    setEventTitle,
    setEventDescription,
    setEventStartTime,
    setEventEndDate,
    setEventEndTime,
    setEventAllDay,
    setEventColor,
    closeModal,
    openCreateModal,
    startEditEvent,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
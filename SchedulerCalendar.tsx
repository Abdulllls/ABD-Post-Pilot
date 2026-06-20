import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Topbar from "../components/Topbar";
import api from "../lib/api";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: enUS }),
  getDay,
  locales,
});

interface QueueItem {
  id: string;
  scheduled_at: string;
  status: string;
}

export default function SchedulerCalendar() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    api.get<QueueItem[]>("/api/queue").then((res) => {
      setEvents(
        res.data.map((item) => ({
          title: `${item.status.toUpperCase()} post`,
          start: new Date(item.scheduled_at),
          end: new Date(item.scheduled_at),
          allDay: false,
        }))
      );
    });
  }, []);

  return (
    <div>
      <Topbar title="Scheduler Calendar" />
      <div className="p-8">
        <div className="glass p-4" style={{ height: "75vh" }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            className="text-black"
          />
        </div>
      </div>
    </div>
  );
}

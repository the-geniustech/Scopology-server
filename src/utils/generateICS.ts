import { createEvent, EventAttributes } from "ics";

interface ICalOptions {
  title: string;
  description: string;
  location: string;
  start: Date;
  durationMinutes: number;
  timezone?: string;
  recurrenceRule?: string;
  organizer?: {
    name: string;
    email: string;
  };
}

export const generateICS = ({
  title,
  description,
  location,
  start,
  durationMinutes,
  timezone,
  recurrenceRule,
  organizer,
}: ICalOptions): Promise<string> => {
  return new Promise((resolve, reject) => {
    const event: EventAttributes = {
      start: [
        start.getFullYear(),
        start.getMonth() + 1,
        start.getDate(),
        start.getHours(),
        start.getMinutes(),
      ],
      title,
      description,
      location,
      status: "CONFIRMED",
      duration: { minutes: durationMinutes },
      startInputType: "local",
      startOutputType: "local",
    };

    if (recurrenceRule) event.recurrenceRule = recurrenceRule;
    if (organizer) event.organizer = organizer;

    createEvent(event, (error, value) => {
      if (error) return reject(error);
      resolve(value);
    });
  });
};

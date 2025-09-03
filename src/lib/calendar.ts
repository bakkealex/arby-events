import { createEvent, EventAttributes } from "ics";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  location?: string;
}

export function generateICSFile(events: CalendarEvent[]): string | null {
  try {
    const icsEvents: EventAttributes[] = events.map(event => {
      const start = event.startDate;
      const end = event.endDate;

      return {
        uid: event.id,
        title: event.title,
        description: event.description || "",
        location: event.location || "",
        start: [
          start.getFullYear(),
          start.getMonth() + 1,
          start.getDate(),
          start.getHours(),
          start.getMinutes(),
        ],
        end: [
          end.getFullYear(),
          end.getMonth() + 1,
          end.getDate(),
          end.getHours(),
          end.getMinutes(),
        ],
        status: "CONFIRMED",
        busyStatus: "BUSY",
        organizer: {
          name: process.env.APP_NAME || "Arby Events",
          email: process.env.EMAIL_FROM || "",
        },
        attendees: [],
      };
    });

    // Generate ICS content
    let icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//${process.env.APP_NAME || "Arby Events"}//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
`;

    for (const event of icsEvents) {
      const { error, value } = createEvent(event);
      if (error) {
        console.error("Error creating ICS event:", error);
        continue;
      }
      if (value) {
        // Remove the VCALENDAR wrapper from individual events
        const eventContent = value
          .replace("BEGIN:VCALENDAR\r\n", "")
          .replace("VERSION:2.0\r\n", "")
          .replace("PRODID:adamgibbons/ics\r\n", "")
          .replace("CALSCALE:GREGORIAN\r\n", "")
          .replace("METHOD:PUBLISH\r\n", "")
          .replace("END:VCALENDAR\r\n", "");

        icsContent += eventContent;
      }
    }

    icsContent += "END:VCALENDAR";
    return icsContent;
  } catch (error) {
    console.error("Error generating ICS file:", error);
    return null;
  }
}

export function generateSingleEventICS(event: CalendarEvent): string | null {
  try {
    const start = event.startDate;
    const end = event.endDate;

    const icsEvent: EventAttributes = {
      uid: event.id,
      title: event.title,
      description: event.description || "",
      location: event.location || "",
      start: [
        start.getFullYear(),
        start.getMonth() + 1,
        start.getDate(),
        start.getHours(),
        start.getMinutes(),
      ],
      end: [
        end.getFullYear(),
        end.getMonth() + 1,
        end.getDate(),
        end.getHours(),
        end.getMinutes(),
      ],
      status: "CONFIRMED",
      busyStatus: "BUSY",
      organizer: {
        name: process.env.APP_NAME || "Arby Events",
        email: process.env.EMAIL_FROM || "",
      },
    };

    const { error, value } = createEvent(icsEvent);

    if (error) {
      console.error("Error creating ICS event:", error);
      return null;
    }

    return value || null;
  } catch (error) {
    console.error("Error generating single event ICS:", error);
    return null;
  }
}

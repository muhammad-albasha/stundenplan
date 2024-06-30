import { getDayIndex, generateId, dateString } from "./rechner.js";

export const MODE = {
  VIEW: 1,
  UPDATE: 2,
  CREATE: 3,
};
export class Event {
  constructor(data) {
    this.id = data.id || generateId();
    this.college = data.college;
    this.title = data.title;
    this.start = data.start;
    this.end = data.end;
    this.date = data.date;
    this.prevDate = this.date;
    this.description = data.description;
    this.color = data.color;
  }
  get dayIndex() {
    return getDayIndex(new Date(this.date));
  }

  get duration() {
    return (
      (new Date(`${this.date}T${this.end}`).getTime() -
        new Date(`${this.date}T${this.start}`).getTime()) /
      (1000 * 60)
    );
  }

  get startHour() {
    return parseInt(this.start.substring(0, 2));
  }

  get startMinutes() {
    return parseInt(this.start.substring(3, 5));
  }

  get endHour() {
    return parseInt(this.end.substring(0, 2));
  }

  get endMinutes() {
    return parseInt(this.end.substring(3, 5));
  }

  saveIn(calendar) {
    if (this.prevDate && this.date !== this.prevDate) {
      if (calendar.events[this.prevDate]) {
        delete calendar.events[this.prevDate][this.id];
        if (Object.keys(calendar.events[this.prevDate]).length === 0) {
          delete calendar.events[this.prevDate];
        }
      }
    }
    if (!calendar.events) {
      calendar.events = {};
    }
    if (!calendar.events[this.date]) {
      calendar.events[this.date] = {};
    }

    calendar.events[this.date][this.id] = this;

    calendar.saveEvents();
  }
  showIn(calendar) {
    if (
      this.date < dateString(calendar.weekStart) ||
      this.date > dateString(calendar.weekEnd)
    ) {
      $(`#${this.id}`).remove();
      return;
    }
    let gEvent = false;
    const showedEventsInSameDay = calendar.showedInEvents.filter(
      (event) => event.date === this.date
    );
    showedEventsInSameDay.forEach((event) => {
      if (
        (this.start >= event.start && this.start < event.end) ||
        (this.end >= event.start && this.end <= event.end)
      ) {
        gEvent = true;
      }
    });
    let eventSlot;
    if ($(`#${this.id}`).length) {
      eventSlot = $(`#${this.id}`);
    } else {
      eventSlot = $("<div></div>")
        .addClass(gEvent ? "event two" : "event")
        .attr("id", this.id)
        .click(() => this.clickIn(calendar));
    }
    const h = calendar.slotHeight;
    eventSlot
      .text(this.title)
      .prepend(
        $("<div></div>")
          .text(this.college)
          .css("font-size", "12px")
          .addClass("eventcolor")
      )
      .append(
        $("<div></div>")
          .text(this.description)
          .css("font-size", "12px")
          .addClass("eventcolor")
      )
      .css("top", (this.startHour - 8 + this.startMinutes / 60) * h + 2 + "px")
      .css(
        "bottom",
        13 * h - (this.endHour - 8 + this.endMinutes / 60) * h + 1 + "px"
      )
      .css("backgroundColor", `var(--color-${this.color})`)
      .css("outline-width", "thin");

    // Check if the event has start: "08:00" and end: "21:00"
    if (this.start === "08:00" && this.end === "21:00") {
      eventSlot.css("background-color", "#ffffff");
      eventSlot.css("text-align", "center");
      eventSlot.css("padding-top", "350px");
      eventSlot.css("font-weight", "bold");
    }

    eventSlot.appendTo(`.day[data-dayIndex=${this.dayIndex}] .slots`);
    const duration = this.duration;
    if (duration < 45) {
      eventSlot.removeClass("shortEvent").addClass("veryShortEvent");
    } else if (duration < 59) {
      eventSlot.removeClass("veryShortEvent").addClass("shortEvent");
    } else {
      eventSlot.removeClass("shortEvent").removeClass("veryShortEvent");
    }
    calendar.showedInEvents.push(this);
  }

  clickIn(calendar) {
    if (calendar.mode != MODE.VIEW) return;
    calendar.mode = MODE.UPDATE;
    calendar.openModal(this);
  }

  updateIn(calendar) {
    this.prevDate = this.date;
    this.college = $("#eventCollege").val();
    this.title = $("#eventTitle").val();
    this.start = $("#eventStart").val();
    this.end = $("#eventEnd").val();
    this.date = $("#eventDate").val();
    this.description = $("#eventDescription").val();
    this.color = $(".color.active").attr("data-color");
    this.saveIn(calendar);
    this.showIn(calendar);
    calendar.refreshView();
  }

  deleteIn(calendar) {
    calendar.closeModal();
    $(`#${this.id}`).remove();
    delete calendar.events[this.date][this.id];
    if (Object.values(calendar.events[this.date]).length == 0) {
      delete calendar.events[this.date];
    }
    calendar.saveEvents();
    calendar.refreshView();
  }

  isValidIn(calendar) {
    const newStart = $("#eventStart").val();
    const newEnd = $("#eventEnd").val();
    const newDate = $("#eventDate").val();
    if (calendar.events[newDate]) {
      const events = Object.values(calendar.events[newDate]).filter(
        (event) =>
          event.id != this.id && event.end > newStart && event.start < newEnd
      );
      //   if (events.length >= 2) {
      //     $("#errors").text(`Dies kollidiert mit dem Ereignis`);
      //     return false;
      //   }
    }
    const duration =
      (new Date(`${newDate}T${newEnd}`).getTime() -
        new Date(`${newDate}T${newStart}`).getTime()) /
      (1000 * 60);
    if (duration < 0) {
      $("#errors").text("Der Beginn kann nicht nach dem ende sein.");
      return false;
    } else if (duration < 30) {
      $("#errors").text("Ereignisse sollten mindestens 30 Minuten lang sein.");
      return false;
    }
    return true;
  }
}

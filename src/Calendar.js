import { dateString, getDayIndex, addDays } from "./rechner.js";
import { Event, MODE } from "./Event.js";

export class Calendar {
  constructor() {
    this.mode = MODE.VIEW;
    this.events = {};
    this.weekOffset = 0;
    this.readyToTrash = false;
    this.slotHeight = 60;
    this.weekStart = null;
    this.weekEnd = null;
    this.eventsLoaded = false;
    this.showedInEvents = [];
  }

  setup() {
    this.setupTimes();
    this.setupDays();
    this.calculateCurrentWeek();
    this.showWeek();
    this.loadEvents();
    this.setupControls();
    this.loadHolidaysFromJson();
  }


  
  // create html section for each day of the week and append it to the calendar div in the export.html
  setupHtml() {
    this.setupTimes();
    this.setupDays();
    this.calculateCurrentWeek();
    this.showWeek();
    this.loadEvents();
    this.loadHolidaysFromJson();
    
    this.setupControls();
  }
  
 
  

  setupControls() {
    $("#nextWeekBtn").click(() => this.changeWeek(1));
    $("#prevWeekBtn").click(() => this.changeWeek(-1));
    $("#downloadButton").click(() => this.downloadEvents());
    $("#addButton").click(() => this.addNewEvent());
    $("#trashButton").click(() => this.trash());
    $("#cancelButton").click(() => this.closeModal());
    $(".color").click(this.changeColor);
    
  }

  setupTimes() {
    const header = $("<div></div>").addClass("columnHeader");
    const slots = $("<div></div>").addClass("slots");
    for (let hour = 8; hour < 21; hour++) {
      $("<div></div>")
        .attr("data-hour", hour)
        .addClass("time")
        .text(`${hour}:00`)
        .appendTo(slots);
    }
    $(".dayTime").append(header).append(slots);
  }

  setupDays() {
    const cal = this;
    $(".day").each(function () {
      const dayIndex = parseInt($(this).attr("data-dayIndex"));
      const name = $(this).attr("data-name");
      const header = $("<div></div>").addClass("columnHeader").text(name);
      const slots = $("<div></div>").addClass("slots");
      $("<div></div>").addClass("dayDisplay").appendTo(header);
      for (let hour = 8; hour < 21; hour++) {
        $("<div></div>")
          .attr("data-hour", hour)
          .appendTo(slots)
          .addClass("slot")
          .click(() => cal.clickSlot(hour, dayIndex))
          .hover(
            () => cal.hoverOver(hour),
            () => cal.hoverOut()
          );
      }
      $(this).append(header).append(slots);
    });
  }

  calculateCurrentWeek() {
    const now = new Date();
    this.weekStart = addDays(now, -getDayIndex(now));
    this.weekEnd = addDays(this.weekStart, 6);
  }

  changeWeek(number) {
    this.weekOffset += number;
    this.weekStart = addDays(this.weekStart, 7 * number);
    this.weekEnd = addDays(this.weekEnd, 7 * number);
    this.showWeek();
    this.loadEvents();
    this.loadHolidaysFromJson();
  }

  showWeek() {
    const options = {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    };
    $("#weekStartDisplay").text(
      this.weekStart.toLocaleDateString(undefined, options)
    );
    $("#weekEndDisplay").text(
      this.weekEnd.toLocaleDateString(undefined, options)
    );

    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const date = addDays(this.weekStart, dayIndex);
      const display = date.toLocaleDateString(undefined, {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      });
      $(`.day[data-dayIndex=${dayIndex}] .dayDisplay`).text(display);
    }
    if (this.weekOffset == 0) {
      this.showCurrentDay();
    } else {
      this.hideCurrentDay();
    }
  }

  showCurrentDay() {
    const now = new Date();
    const dayIndex = getDayIndex(now);
    $(`.day[data-dayIndex=${dayIndex}]`).addClass("currentDay");
  }

  hideCurrentDay() {
    $(".day").removeClass("currentDay");
  }

  hoverOver(hour) {
    $(`.time[data-hour=${hour}]`).addClass("currentTime");
  }

  hoverOut() {
    $(".time").removeClass("currentTime");
  }

  clickSlot(hour, dayIndex) {
    if (this.mode != MODE.VIEW) return;
    this.mode = MODE.CREATE;
    const start = hour.toString().padStart(2, "0") + ":00";
    const end =
      hour < 23
        ? (hour + 1).toString().padStart(2, "0") + ":00"
        : hour.toString().padStart(2, "0") + ":59";

    const date = dateString(addDays(this.weekStart, dayIndex));
    const event = new Event({
      start,
      end,
      date,
      title: "",
      college: "",
      description: "",
      color: "red",
    });
    this.openModal(event);
  }

  changeColor() {
    $(".color").removeClass("active");
    $(this).addClass("active");
  }

  openModal(event) {
    $("#modalTitle").text(
      this.mode == MODE.UPDATE ? "Event aktualisieren" : "Erstelle ein Event"
    );
    $("#eventCollege").val(event.college);
    $("#eventTitle").val(event.title);
    $("#eventDate").val(event.date);
    $("#eventStart").val(event.start);
    $("#eventEnd").val(event.end);
    $("#eventDescription").val(event.description);
    $(".color").removeClass("active");
    $(`.color[data-color=${event.color}]`).addClass("active");
    if (this.mode == MODE.UPDATE) {
      $("#submitButton").val("aktualisieren");
      $("#deleteButton")
        .show()
        .off("click")
        .click(() => event.deleteIn(this));
    } else if (this.mode == MODE.CREATE) {
      $("#submitButton").val("Erstellen");
      $("#deleteButton").hide();
    }
    $("#eventModal").fadeIn(200);
    $("#eventTitle").focus();
    $("#calendar").addClass("opaque");
    $("#eventModal")
      .off("submit")
      .submit((e) => {
        e.preventDefault();
        this.submitModal(event);
      });
  }

  submitModal(event) {
    if (event.isValidIn(this)) {
      event.updateIn(this);
      this.closeModal();
    }
  }

  closeModal() {
    $("#eventModal").fadeOut(200);
    $("#errors").text("");
    $("#calendar").removeClass("opaque");
    this.mode = MODE.VIEW;
  }

  addNewEvent() {
    if (this.mode != MODE.VIEW) return;
    this.mode = MODE.CREATE;
    const event = new Event({
      start: "12:00",
      end: "13:00",
      date: dateString(this.weekStart),
      college: "",
      title: "",
      description: "",
      color: "red",
    });
    this.openModal(event);
    this.refreshView();
  }

  readJsonFile(file) {
    var rawFile = new XMLHttpRequest();
    var object;
    rawFile.onreadystatechange = function () {
      if (this.readyState == 4 && this.status == 200) {
        var responseObject;
        try {
          responseObject = JSON.parse(rawFile.responseText);
        } catch (ex) {
          console.log(
            "Fehler im Request, file ",
            file,
            "; Fehler ",
            ex,
            "; response: ",
            rawFile
          );
        }
        if (!$.isEmptyObject(responseObject)) {
          object = responseObject;
        } else {
          return {};
        }
      }
    };

    rawFile.open("GET", file, false);
    rawFile.send();
    return object;
  }

  downloadEvents() {
    let exportName = "event"; /* prompt("Dateiname:", "events"); */
    if (exportName != null || exportName == "") {
      var dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(this.events));
      var downloadAnchorNode = document.createElement("a");
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", exportName + ".json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
  }
  saveEvents() {
    localStorage.setItem("events", JSON.stringify(this.events));
  }

  refreshView() {
    // Re-render the events on the calendar
    Object.values(this.events).forEach((eventObj) => {
      Object.values(eventObj).forEach((event) => {
        event.showIn(this);
      });
    });
  }
  loadEvents() {
    this.showedInEvents = [];
    const fileInput = document.getElementById("file");
    if (fileInput) {
     
    fileInput.addEventListener("change", (event) => {
      let reader = new FileReader();
      reader.onload = function (event) {
        let str = event.target.result;
        let json = JSON.parse(str);
        this.events = json;
        if (this.events) {
          for (const date of Object.keys(this.events)) {
            for (const id of Object.keys(this.events[date])) {
              const event = new Event(this.events[date][id]);
              this.events[date][id] = event;
            }
          }
          localStorage.setItem("events", JSON.stringify(this.events));
          location.reload();
        }
      };
      reader.readAsText(file.files[0]);
    });
  }

    $(".event").remove();

    if (!this.eventsLoaded) {
      this.events = JSON.parse(localStorage.getItem("events"));
      if (this.events) {
        for (const date of Object.keys(this.events)) {
          for (const id of Object.keys(this.events[date])) {
            const event = new Event(this.events[date][id]);
            this.events[date][id] = event;
          }
        }
      }
      this.eventsLoaded = true;
    }
    if (this.events) {
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const date = dateString(addDays(this.weekStart, dayIndex));
        if (this.events[date]) {
          for (const event of Object.values(this.events[date])) {
            event.showIn(this);
          }
        }
      }
    } else {
      this.events = {};
    }
  }
  trash() {
    if (this.mode != MODE.VIEW) return;
    if (confirm("Wollen Sie alle Events löschen?")) {
      this.events = {};
      this.saveEvents();
      $(".event").remove();
      localStorage.removeItem("legende");
      localStorage.removeItem("hinweis");
      $("#hinweisInput").val("");
      $("#tbody").empty();
      let legende = [];
      localStorage.setItem("legende", JSON.stringify(legende));
    }
  }
  loadHolidaysFromJson() {
    fetch('feiertagen.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        this.initializeHolidays(data);
      })
      .catch(error => console.error('Fehler beim Laden der Feiertage:', error));
  }
  
  initializeHolidays(holidaysData) {
    for (const [date, events] of Object.entries(holidaysData)) {
      if (!this.events[date]) {
        this.events[date] = {}; 
      }
  
      for (const [title, eventDetails] of Object.entries(events)) {
        const eventExists = Object.values(this.events[date]).some(event => event.title === title);
        if (eventExists) {
          continue;
        }
        const event = new Event({
          date,
          title,
          start: eventDetails.start,
          end: eventDetails.end,
        });
        console.log(event.title);
        const eventId = Date.now().toString(); 
        this.events[date][eventId] = event;
         event.showIn(this); 
      }
    }
  }

}

$(document).ready(function () {
  var rowIdx = 0;
  let localStoreHinweis = localStorage.getItem("hinweis");
  $("#hinweisInput").val(localStoreHinweis);
  $("#hinweisInput").on("blur", function () {
    let value = $("#hinweisInput").val();
    localStorage.setItem("hinweis", value);
  });

  let localStoreLegende = localStorage.getItem("legende");
  let legende = localStoreLegende ? JSON.parse(localStoreLegende) : [];
  legende.forEach((value) => {
    $("#tbody").append(`
        <tr id="R${++rowIdx}">
                <td class="text-center">
                    <button class="removeLegende"
                    type="button">
                        X
                    </button>
                </td>
                <td class="row-index">
                    <th style="color: white; margin-bottom:3px text-align: left">${value}</th>
                </td>
            </tr>
        `);
  });
  $("#addLegendeBtn").on("click", function () {
    let legende = JSON.parse(localStorage.getItem("legende")) || [];
    let value = $("#legendeInput").val();
    if (value === "") return;
    if (legende.length < 6) {
      legende.push(value);
      localStorage.setItem("legende", JSON.stringify(legende));
    } else {
      alert("Sie können nur 6 Legenden hinzufügen");
      return;
    }
    localStorage.setItem("legende", JSON.stringify(legende));
    $("#tbody").append(`
            <tr id="R${++rowIdx}">
                <td class="text-center">
                    <button class="removeLegende"
                    type="button">
                        X
                    </button>
                </td>
                <td class="row-index">
                    <th style="color: white; margin-bottom:3px; text-align: left">${value}</th>
                </td>
            </tr>
        `);
    $("#legendeInput").val("");
  });
  $("#tbody").on("click", ".removeLegende", function () {
    let index = $(this).closest("tr").index();
    legende.splice(index, 1);
    localStorage.setItem("legende", JSON.stringify(legende));
    $(this).closest("tr").remove();
  });
});

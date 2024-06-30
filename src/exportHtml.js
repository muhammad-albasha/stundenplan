import { Calendar } from "./Calendar.js";


// vererrbe alle Methoden und Eigenschaften von Calendar
class exportHtml extends Calendar{

    clickSlot(hour, dayIndex) {
        if (this.mode == MODE.VIEW) return false;
    }
    
    openModal(event) {
        return false;
    }
}

let expo = new exportHtml();
expo.setup();




/**
 * @description       :
 * @author            : pelayochristian.dev@gmail.com
 * @last modified on  : 07-15-2023
 * @last modified by  : pelayochristian.dev@gmail.com
 **/
import { LightningElement, api, track } from 'lwc';
import { Calendar, Day } from './datepickerUtil';

export default class Datepicker extends LightningElement {
    @api labelName;

    @track month;

    _calendar;
    _date = null;
    _selectedDayElement = null;
    _datepickerContainer = null;

    constructor() {
        super();
        const date = new Date(this.date ?? (this.getAttribute('date') || Date.now()));
        const lang = window.navigator.language;
        this._date = new Day(date, lang);
        this._calendar = new Calendar(this._date.year, this._date.monthNumber, lang);
        this.month = this._calendar.month.name;
    }

    renderedCallback() {
        this._datepickerContainer = this.template.querySelector('[data-id="datepicker-main_container"]');
        this.renderMonthDaysElement();
    }

    /**
     * Method used to navigation previous month.
     */
    prevMonth() {
        this._calendar.goToPreviousMonth();
        this.month = this._calendar.month.name;
    }

    /**
     * Method used to navigation next month.
     */
    nextMonth() {
        this._calendar.goToNextMonth();
        this.month = this._calendar.month.name;
    }

    isSelectedDate(date) {
        return (
            date.date === this._date.date &&
            date.monthNumber === this._date.monthNumber &&
            date.year === this._date.year
        );
    }

    getMonthDaysMatrix() {
        const firstDayOfTheMonth = this._calendar.month.getDay(1);
        const prevMonth = this._calendar.getPreviousMonth();
        const totalLastMonthFinalDays = firstDayOfTheMonth.dayNumber - 1;
        const totalDays = this._calendar.month.numberOfDays + totalLastMonthFinalDays;
        const monthList = Array.from({ length: totalDays });

        for (let i = totalLastMonthFinalDays; i < totalDays; i++) {
            monthList[i] = this._calendar.month.getDay(i + 1 - totalLastMonthFinalDays);
        }

        for (let i = 0; i < totalLastMonthFinalDays; i++) {
            const inverted = totalLastMonthFinalDays - (i + 1);
            monthList[i] = prevMonth.getDay(prevMonth.numberOfDays - inverted);
        }

        const monthDaysMatrix = monthList.reduce((acc, value, index) => {
            if (index % 7 === 0) {
                acc.push([]);
            }
            acc[acc.length - 1].push(value);
            return acc;
        }, []);

        return monthDaysMatrix;
    }

    /**
     * Construct the DOM Element of the Weekdays to set
     * as a header of the calendar.
     *
     * @returns <Object> DOM Element
     */
    getWeekDaysHeader() {
        // Creating the <tr> element
        const trElement = document.createElement('tr');
        trElement.setAttribute('id', 'defaultPicker-weekdays');

        for (let i = 0; i < this._calendar.weekDays.length; i++) {
            const dayStr = this._calendar.weekDays[i];
            const thElement = document.createElement('th');
            thElement.setAttribute('id', dayStr);
            thElement.setAttribute('scope', 'col');
            thElement.setAttribute('key', dayStr);

            const abbrElement = document.createElement('abbr');
            abbrElement.setAttribute('title', dayStr);
            abbrElement.textContent = dayStr.substring(0, 3);

            thElement.appendChild(abbrElement);
            trElement.appendChild(thElement);
        }

        return trElement;
    }

    renderMonthDaysElement() {
        const monthDaysMatrix = this.getMonthDaysMatrix();
        const tbodyWeekdaysElement = document.createElement('tbody');

        console.log(this._date);
        for (let i = 0; i < monthDaysMatrix.length; i++) {
            const subarray = monthDaysMatrix[i];
            const trElement = document.createElement('tr');

            for (let j = 0; j < subarray.length; j++) {
                const day = subarray[j];
                const key = `${day.date} ${day.month} ${day.year}`;

                const tdElement = document.createElement('td');
                tdElement.setAttribute('aria-selected', 'false');
                tdElement.setAttribute('role', 'gridcell');
                tdElement.setAttribute('tabindex', '0');
                tdElement.setAttribute('aria-label', key);

                const spanElement = document.createElement('span');
                spanElement.setAttribute('class', 'slds-day');
                spanElement.textContent = day.date;
                // eslint-disable-next-line no-unused-vars
                spanElement.addEventListener('click', (e) => this.handleSelectDay(tdElement, day));
                tdElement.appendChild(spanElement);

                if (day.monthNumber === this._calendar.month.number) {
                    tdElement.setAttribute('class', '');
                } else {
                    tdElement.setAttribute('class', 'slds-day_adjacent-month');
                }

                if (this.isSelectedDate(day)) {
                    tdElement.classList.add('slds-is-selected');
                    this._selectedDayElement = tdElement;
                }

                trElement.appendChild(tdElement);
            }

            tbodyWeekdaysElement.appendChild(trElement);
        }

        const tableElement = this.template.querySelector('[data-id="datepicker-table"]');
        while (tableElement.firstChild) {
            tableElement.removeChild(tableElement.firstChild);
        }

        // Append the Header and the Body to the Calendar table.
        tableElement.appendChild(this.getWeekDaysHeader());
        tableElement.appendChild(tbodyWeekdaysElement);
    }

    handleSelectDay(element, day) {
        if (day.isEqualTo(this._date)) return;

        this._date = day;

        if (day.monthNumber !== this._calendar.month.number) {
            this.prevMonth();
        } else {
            element.classList.add('slds-is-selected');
            this._selectedDayElement.classList.remove('slds-is-selected');
            this._selectedDayElement = element;
        }

        this._datepickerContainer.classList.remove('slds-is-open');
    }

    toggleDatepicker() {
        this._datepickerContainer.classList.add('slds-is-open');
    }
}

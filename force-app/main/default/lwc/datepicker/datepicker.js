/**
 * @description       :
 * @author            : pelayochristian.dev@gmail.com
 * @last modified on  : 07-15-2023
 * @last modified by  : pelayochristian.dev@gmail.com
 **/
import { LightningElement, track } from 'lwc';
import { Calendar, Day } from './datepickerUtil';

export default class Datepicker extends LightningElement {
    @track month;

    _calendar;
    _date = null;

    constructor() {
        super();
        const date = new Date(this.date ?? (this.getAttribute('date') || Date.now()));
        const lang = window.navigator.language;
        this._date = new Day(date, lang);
        this._calendar = new Calendar(this._date.year, this._date.monthNumber, lang);
        this.month = this._calendar.month.name;
    }

    renderedCallback() {
        this.renderMonthDaysElement();
    }

    prevMonth() {
        this._calendar.goToPreviousMonth();
        this.month = this._calendar.month.name;
    }

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

    get getWeekDaysHeader() {
        const result = this._calendar.weekDays.map((weekDay) => ({
            fullName: `defaultPicker-${weekDay}`,
            shortName: weekDay.substring(0, 3),
        }));

        return result;
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

    renderMonthDaysElement() {
        const monthDaysMatrix = this.getMonthDaysMatrix();
        let tbodyWeekdaysStr = '';
        for (let i = 0; i < monthDaysMatrix.length; i++) {
            const subarray = monthDaysMatrix[i];
            tbodyWeekdaysStr += `<tr>`;
            for (let j = 0; j < subarray.length; j++) {
                const day = subarray[j];
                const key = `${day.date} ${day.month} ${day.year}`;

                if (day.monthNumber === this._calendar.month.number) {
                    tbodyWeekdaysStr += `<td aria-selected="false" class="" role="gridcell" tabindex="0" aria-label="${key}">
                                            <span class="slds-day">${day.date}</span>
                                        </td>`;
                } else {
                    tbodyWeekdaysStr += ` <td aria-selected="false" class="slds-day_adjacent-month" role="gridcell" aria-label="${key}">
                                            <span class="slds-day">${day.date}</span>
                                        </td>`;
                }

                // TODO
                if (this.isSelectedDate(day)) {
                    // el.classList.add('selected');
                    // this.selectedDayElement = el;
                }
            }
            tbodyWeekdaysStr += `<tr>`;
        }

        const element = this.template.querySelector(`[data-id="datepicker-weekdays"]`);
        // eslint-disable-next-line @lwc/lwc/no-inner-html
        element.innerHTML = tbodyWeekdaysStr;
    }
}

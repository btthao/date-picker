class Calendar {
    constructor() {
        this.today = new Date();
        this.month = this.today.getMonth();
        this.year = this.today.getFullYear();
        this.datePicked = null;
        this.language = "EN";
        this.months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];
    }

    getCalendar() {
        const firstDayOfMonth = new Date(
            this.today.getFullYear(),
            this.today.getMonth(),
            1
        ).getDay();
        const lastDayOfMonth = new Date(
            this.today.getFullYear(),
            this.today.getMonth() + 1,
            0
        ).getDay();
        const lastDateOfMonth = new Date(
            this.today.getFullYear(),
            this.today.getMonth() + 1,
            0
        ).getDate();
        const lastDateOfPrevMonth = new Date(
            this.today.getFullYear(),
            this.today.getMonth(),
            0
        ).getDate();

        let htmlString = [];

        // previous month
        if (firstDayOfMonth > 0) {
            for (
                let i = lastDateOfPrevMonth - firstDayOfMonth + 1; i <= lastDateOfPrevMonth; i++
            ) {
                if (htmlString.length === 0) {
                    htmlString.push("<tr>");
                } else if ((htmlString.length + 1) % 9 === 0) {
                    htmlString.push("</tr>");
                    htmlString.push("<tr>");
                }
                htmlString.push(`<td class='prev-month-dates'>${i}</td>`);
            }
        }

        // current month
        for (let i = 1; i <= lastDateOfMonth; i++) {
            if (htmlString.length === 0) {
                htmlString.push("<tr>");
            } else if ((htmlString.length + 1) % 9 === 0) {
                htmlString.push("</tr>");
                htmlString.push("<tr>");
            }
            htmlString.push(`<td class='current-month'>${i}</td>`);
        }

        // next month
        if (lastDayOfMonth < 6) {
            for (let i = 1; i < 7 - lastDayOfMonth; i++) {
                htmlString.push(`<td>${i}</td>`);
            }
        }

        htmlString.push("</tr>");

        const calendarBody = document.getElementById("calendar-body");
        calendarBody.innerHTML = htmlString.join("");

        this.getCalendarHead();
        this.determineDaysInTheFuture();
        this.pickDate();
    }

    getCalendarHead() {
        const calendarHead = document.getElementById("calendar-head");
        if (this.language === "EN") {
            calendarHead.innerHTML = `${this.months[this.month]} ${this.year}`;
        } else {
            calendarHead.innerHTML = `Tháng ${this.month + 1}, ${this.year}`;
        }
    }

    getNextMonth() {
        this.today.setMonth(this.today.getMonth() + 1);
        this.month = this.today.getMonth();
        this.year = this.today.getFullYear();
        this.getCalendar();
    }

    getPrevMonth() {
        this.today.setMonth(this.today.getMonth() - 1);
        this.month = this.today.getMonth();
        this.year = this.today.getFullYear();
        this.getCalendar();
    }

    determineDaysInTheFuture() {
        const today = new Date();
        const todayMonth = today.getMonth();
        const todayYear = today.getFullYear();
        const todayDate = today.getDate();
        const todayDay = today.getDay();

        // if in the past then return
        if (
            this.year < todayYear ||
            (this.year == todayYear && this.month < todayMonth)
        ) {
            return;
        }

        // Select days in the future users can pick
        const allDays = document.querySelectorAll(".current-month");

        for (const day of allDays) {
            const dayOfWeek = new Date(
                this.year,
                this.month,
                day.textContent
            ).getDay();

            const isChristmas = day.textContent == 24 && this.month == 11;
            const isWeekend = dayOfWeek == 0 || dayOfWeek == 6;

            if (isChristmas) {
                day.classList.add("christmas");
            }

            // add if neither weekend nor christmas
            if (!isWeekend && !isChristmas) {
                day.classList.add("can-pick");
            }

            // if same month then remove days before today including today
            if (this.year == todayYear && this.month == todayMonth) {
                if (day.textContent <= todayDate) {
                    day.classList.remove("can-pick");
                    if (day.textContent == todayDate) {
                        day.classList.add("today");
                    }
                }
            }
        }

        // users can only pick dates from next week, remove all days from that same week
        // case 1: today date is in the current month
        if (
            this.year == todayYear &&
            this.month == todayMonth &&
            todayDay !== 0 &&
            todayDay !== 6
        ) {
            for (let i = 0; i < 6 - todayDay; i++) {
                if (todayDate - 1 + i === allDays.length) {
                    break;
                }
                allDays[todayDate - 1 + i].classList.remove("can-pick");
            }
        }

        // case 2: today date is in the last few days of the months and happen to be in the same week as first days of next month
        const prevMonthDates = document.querySelectorAll(".prev-month-dates");
        if (prevMonthDates.length > 1) {
            // if it's on sunday then doesn't matter so start from 1
            for (let i = 1; i < prevMonthDates.length; i++) {
                if (
                    prevMonthDates[i].textContent == todayDate &&
                    todayMonth == this.month - 1 &&
                    todayYear == this.year
                ) {
                    const thatWeek = prevMonthDates[i].parentElement.childNodes;
                    for (const day of thatWeek) {
                        day.classList.remove("can-pick");
                    }
                    break;
                }
            }
        }
    }

    pickDate() {
        const daysToPick = document.querySelectorAll(".can-pick");
        for (const day of daysToPick) {
            if (this.datePicked) {
                const [d, m, y] = this.datePicked;
                if (day.textContent == d && this.month == m && this.year == y) {
                    day.classList.add("picked");
                }
            }
            day.addEventListener("click", () => {
                this.datePicked = [day.textContent, this.month, this.year];
                this.insertDatePicked();
                for (const dayToRemove of daysToPick) {
                    dayToRemove.classList.remove("picked");
                }
                day.classList.add("picked");
            });
        }
    }

    insertDatePicked() {
        let insertString = "";
        const datePickedInsert = document.getElementById("date-picked");

        if (!this.datePicked) {
            if (this.language == "EN") {
                insertString += "<p>You have not selected a date.</p>";
            } else {
                insertString += "<p>Bạn chưa chọn ngày.</p>";
            }
        } else {
            const [date, month, year] = this.datePicked;

            if (this.language === "EN") {
                insertString += `
                <h6>You have selected this date:</h6>
                <p>${date} ${this.months[month]} ${year}</p>`;
            } else {
                insertString += `
                <h6>Bạn chọn ngày:</h6>
                <p>${date} tháng ${month + 1}, ${year}</p>`;
            }
        }

        datePickedInsert.innerHTML = insertString;
    }

    insertTodayDate() {
        const todayDate = document.getElementById("today-date");
        const today = new Date();
        if (this.language === "EN") {
            todayDate.innerHTML = `
            <h1>Today</h1>
        <h4>${today.getDate()} ${
        this.months[today.getMonth()]
      } ${today.getFullYear()}</h4>
        `;
        } else {
            todayDate.innerHTML = `
            <h1>Hôm nay</h1>
        <h4>${today.getDate()} tháng ${
        today.getMonth() + 1
      }, ${today.getFullYear()}</h4>
        `;
        }
    }

    changeLanguage(language) {
        this.language = language;
        this.insertTodayDate();
        this.insertDatePicked();
        this.getCalendarHead();
        this.insertCalendarDays();
    }

    insertCalendarDays() {
        const en = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
            (day) => `<th>${day}</th>`
        );
        const vn = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map(
            (day) => `<th>${day}</th>`
        );
        const calendarDays = document.getElementById("calendar-days");

        if (this.language == "EN") {
            calendarDays.innerHTML = en.join("");
        } else {
            calendarDays.innerHTML = vn.join("");
        }
    }
}

const calendar = new Calendar();
calendar.getCalendar();
calendar.insertTodayDate();
calendar.insertCalendarDays();
calendar.insertDatePicked();

const prev = document.querySelector("#prev-month");
const next = document.querySelector("#next-month");
const languageSwitch = document.getElementById("flexSwitchCheckChecked");

prev.addEventListener("click", () => {
    calendar.getPrevMonth();
});

next.addEventListener("click", () => {
    calendar.getNextMonth();
});

languageSwitch.addEventListener("click", () => {
    if (languageSwitch.checked) {
        calendar.changeLanguage("EN");
    } else {
        calendar.changeLanguage("VN");
    }
});
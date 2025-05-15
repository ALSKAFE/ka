const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

let today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth(); // صفر = يناير

function getStorageKey(year, month) {
  return `bookings_${year}_${month}`;
}

function loadBookings(year, month) {
  const data = localStorage.getItem(getStorageKey(year, month));
  return data ? JSON.parse(data) : {};
}

function saveBookings(year, month, bookings) {
  localStorage.setItem(getStorageKey(year, month), JSON.stringify(bookings));
}

function buildCalendar(year, month) {
  calendar.innerHTML = "";
  const bookings = loadBookings(year, month);
  
  // اسماء الشهور بالعربي
  const monthsArabic = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  monthYear.textContent = `${monthsArabic[month]} ${year}`;
  
  // أول يوم في الشهر (0=الأحد .. 6=السبت)
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();

  // عدد أيام الشهر
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // إضافة مربعات فارغة لبداية الأسبوع حسب بداية الشهر
  for (let i = 0; i < startDay; i++) {
    const emptyDiv = document.createElement("div");
    emptyDiv.classList.add("day", "empty");
    calendar.appendChild(emptyDiv);
  }

  // إنشاء مربعات الأيام
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");

    const dayNumber = document.createElement("div");
    dayNumber.classList.add("day-number");
    dayNumber.textContent = day;
    dayDiv.appendChild(dayNumber);

    // حالة الحجز لهذا اليوم
    const booking = bookings[day] || { morning: false, evening: false };

    const bookedCount = (booking.morning ? 1 : 0) + (booking.evening ? 1 : 0);

    if (bookedCount === 1) {
      dayDiv.classList.add("one-period");
    } else if (bookedCount === 2) {
      dayDiv.classList.add("two-periods");
    } else {
      dayDiv.classList.add("free");
    }

    dayDiv.addEventListener("click", () => {
      openBookingDialog(day, booking, bookings);
    });

    calendar.appendChild(dayDiv);
  }
}

function openBookingDialog(day, booking, bookings) {
  const morningText = booking.morning ? "محجوزة" : "فارغة";
  const eveningText = booking.evening ? "محجوزة" : "فارغة";

  let message = `اليوم: ${day}\nالفترة الصباحية: ${morningText}\nالفترة المسائية: ${eveningText}\n\n`;
  message += "اختر:\n";
  message += booking.morning ? "1 - إلغاء الحجز الصباحي\n" : "1 - حجز الفترة الصباحية\n";
  message += booking.evening ? "2 - إلغاء الحجز المسائي\n" : "2 - حجز الفترة المسائية\n";
  message += "0 - إلغاء";

  const choice = prompt(message, "0");

  if (choice === "1") {
    booking.morning = !booking.morning;
  } else if (choice === "2") {
    booking.evening = !booking.evening;
  } else {
    return; // الغاء
  }

  bookings[day] = booking;
  saveBookings(currentYear, currentMonth, bookings);
  buildCalendar(currentYear, currentMonth);
}

prevMonthBtn.addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  buildCalendar(currentYear, currentMonth);
});

nextMonthBtn.addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  buildCalendar(currentYear, currentMonth);
});

// بناء التقويم لأول مرة
buildCalendar(currentYear, currentMonth);

const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const prevMonthBtn = document.getElementById("prevMonth");
const nextMonthBtn = document.getElementById("nextMonth");

let today = new Date();
let currentYear = today.getFullYear();
let currentMonth = today.getMonth(); // 0 - يناير

// تحميل وحفظ الحجوزات في localStorage بشكل منفصل لكل سنة وشهر
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

// بناء تقويم الشهر
function buildCalendar(year, month) {
  calendar.innerHTML = "";
  monthYear.textContent = `${year} - ${month + 1}`;

  const bookings = loadBookings(year, month);

  // أول يوم في الشهر
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay(); // 0: الأحد ... 6: السبت (بما أن الاتجاه عربي، يمكن تعديل إذا تريد)

  // عدد أيام الشهر
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // إضافة أيام فارغة قبل بداية الشهر (بحسب بداية الأسبوع الأحد)
  // في حال تريد الأحد أول يوم الأسبوع اترك كما هو
  for (let i = 0; i < startDay; i++) {
    const emptyDiv = document.createElement("div");
    emptyDiv.classList.add("day", "empty");
    calendar.appendChild(emptyDiv);
  }

  // بناء أيام الشهر
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");

    // نضيف رقم اليوم
    const dayNum = document.createElement("div");
    dayNum.textContent = day;
    dayDiv.appendChild(dayNum);

    // حالة الحجز لليوم
    const booking = bookings[day] || { morning: false, evening: false };

    // تعيين اللون حسب عدد الفترات المحجوزة
    const bookedCount = (booking.morning ? 1 : 0) + (booking.evening ? 1 : 0);
    if (bookedCount === 1) {
      dayDiv.classList.add("one-period");
    } else if (bookedCount === 2) {
      dayDiv.classList.add("two-periods");
    } else {
      dayDiv.classList.add("free");
    }

    // عند الضغط على اليوم
    dayDiv.addEventListener("click", () => {
      showBookingDialog(day, booking, bookings);
    });

    calendar.appendChild(dayDiv);
  }
}

// نافذة الحجز وعرض المعلومات
function showBookingDialog(day, booking, bookings) {
  const morningStatus = booking.morning ? "محجوزة" : "فارغة";
  const eveningStatus = booking.evening ? "محجوزة" : "فارغة";

  let msg = `اليوم: ${day}\nالفترة الصباحية: ${morningStatus}\nالفترة المسائية: ${eveningStatus}\n\n`;

  msg += "اختر ما تريد:\n";
  msg += booking.morning ? "1 - إلغاء الحجز الصباحي\n" : "1 - حجز الفترة الصباحية\n";
  msg += booking.evening ? "2 - إلغاء الحجز المسائي\n" : "2 - حجز الفترة المسائية\n";
  msg += "0 - إلغاء";

  const choice = prompt(msg, "0");

  if (choice === "1") {
    booking.morning = !booking.morning;
  } else if (choice === "2") {
    booking.evening = !booking.evening;
  } else {
    return; // إلغاء
  }

  bookings[day] = booking;
  saveBookings(currentYear, currentMonth, bookings);
  buildCalendar(currentYear, currentMonth);
}

// أزرار التنقل بين الأشهر
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

// بناء التقويم أول مرة
buildCalendar(currentYear, currentMonth);

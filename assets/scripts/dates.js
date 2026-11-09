const MONTH_NAMES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const MONTH_SHORT = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SET", "OCT", "NOV", "DIC"];
const WEEKDAY_SHORT = ["L", "M", "M", "J", "V", "S", "D"];

function toIsoDate(date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return date.getFullYear() + "-" + month + "-" + day;
}

function parseIsoDate(isoDate) {
  const parts = isoDate.split("-").map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function todayIso() {
  return toIsoDate(new Date());
}

function addDays(isoDate, days) {
  const date = parseIsoDate(isoDate);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

function daysUntil(isoDate) {
  const today = parseIsoDate(todayIso());
  const target = parseIsoDate(isoDate);
  return Math.round((target - today) / 86400000);
}

function formatShortDate(isoDate) {
  const parts = isoDate.split("-");
  return parts[2] + "/" + parts[1] + "/" + parts[0];
}

function formatLongDate(isoDate) {
  const date = parseIsoDate(isoDate);
  return date.getDate() + " de " + MONTH_NAMES[date.getMonth()] + " de " + date.getFullYear();
}

function formatMonthYear(year, month) {
  const name = MONTH_NAMES[month];
  return name.charAt(0).toUpperCase() + name.slice(1) + " " + year;
}

function describeDueDate(isoDate) {
  const days = daysUntil(isoDate);

  if (days < -1) {
    return "Venció hace " + Math.abs(days) + " días";
  }
  if (days === -1) {
    return "Venció ayer";
  }
  if (days === 0) {
    return "Vence hoy";
  }
  if (days === 1) {
    return "Vence mañana";
  }
  return "Vence el " + formatShortDate(isoDate);
}

function parseTypedDate(text) {
  const match = text.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return toIsoDate(date);
}

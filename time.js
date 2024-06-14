const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const month_long = [
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
const month_short = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "June",
  "July",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];

let now = new Date();

var formatted_time = [
  now.getHours(),
  ":",
  now.getMinutes(),
  ":",
  now.getSeconds(),
  " - ",
  days[now.getDay()],
  " ",
  now.getDate(),
  " ",
  month_short[now.getMonth()],
  " ",
  now.getFullYear(),
].join("");

function updateTime() {
  document.getElementById(
    "last-updated"
  ).innerHTML = `Last Updated: ${formatted_time}`;
}

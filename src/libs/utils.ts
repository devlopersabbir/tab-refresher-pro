export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const random = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const timeFormat = (totalSecond: number | string) => {
  // check totalSecond as string or number
  if (typeof totalSecond === "string") {
    totalSecond = Number(totalSecond); // if string then convert to number
  }
  const minutes = Math.trunc(totalSecond / 60); // dividate by 60 and remove all decimal
  const seconds = totalSecond % 60; // use reminder as second
  let secondWithZero: string;
  let minutesWithZero: string;
  if (seconds < 10 || (minutes < 10 && seconds > 60) || minutes > 60) {
    // if second is lower then 10 then add 0. Like 05
    secondWithZero = `0${seconds}`;
    minutesWithZero = `0${minutes}`;
  } else {
    secondWithZero = seconds.toString();
    minutesWithZero = minutes.toString();
  }
  return `${minutesWithZero}:${secondWithZero}`;
};

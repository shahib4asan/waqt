import axios from "axios";

export async function getPrayerTimes(lat: number, lon: number) {
  const date = new Date().toISOString().split("T")[0];

  const res = await axios.get(
    `https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${lon}&method=2`
  );

  return res.data.data.timings;
}
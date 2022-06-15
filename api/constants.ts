import { readFileSync } from "fs";

export const BASE_URL = "https://jklm.fun/";
export const WORDS = readFileSync("./data/words.txt", "utf-8")
  .split("\n")
  .map((word) => {
    return word.replace("\r", "").toLowerCase();
  });

import axios from "axios";

// @ts-ignore
import TimeAgo from "javascript-time-ago";
// @ts-ignore
import en from "javascript-time-ago/locale/en";
TimeAgo.addLocale(en);

export class Utils{
    private static timeAgo: TimeAgo = new TimeAgo("en-US");
    public static oudated_versions: any = [];

    //public static async pull_outdated_masternode_version() {
    //  const res = await axios({
    //    method: "GET",
    //    url: "/api/outdated-masternode",
    //    headers: {
    //      'Cache-Control': 'no-cache',
    //      'Pragma': 'no-cache',
    //      'Expires': '0',
    //    }
    //  });
    //  this.oudated_versions = res.data;
    //  return res.data;
    //}
    //public static async last_updated() {
    //  const res = await axios({
    //    method: "GET",
    //    url: "/api/last-update",
    //    headers: {
    //      'Cache-Control': 'no-cache',
    //      'Pragma': 'no-cache',
    //      'Expires': '0',
    //    }
    //  });
    //  return res.data;
    //}

    public static timeagoFormat(val: number, word: string = "ago"): string {
      //@ts-ignore
      let timeWord = this.timeAgo.format(val * 1000, "time");
      if (timeWord !== "just now") {
        timeWord += " " + word;
      }
      //@ts-ignore
      return timeWord;
    }

    public static timeagoFormatOnlyDays(val: number, word: string = "ago"): string {
      let timeWord = this.timeAgo.format(val * 1000, {
      //@ts-ignore
        gradation: [
          { unit: "now", factor: 1 },
          { unit: "second", threshold: 0.5, factor: 1 },
          { unit: "minute", factor: 60, threshold: 59.5 },
          { unit: "hour", factor: 60 * 60, threshold: 59.5 * 60 },
          { unit: "day", factor: 60 * 60 * 24, threshold: 23.5 * 60 * 60 },
        ],
      });

      if (timeWord !== "just now") {
        timeWord += " " + word;
      }
      //@ts-ignore
      return timeWord;
    }

    public static timeagoFormatOnlyHours(val: number, word: string = "ago"): string {
      let timeWord = this.timeAgo.format(val * 1000, {
      //@ts-ignore
        gradation: [
          { unit: "now", factor: 1 },
          { unit: "second", threshold: 0.5, factor: 1 },
          { unit: "minute", factor: 60, threshold: 59.5 },
          { unit: "hour", factor: 60 * 60, threshold: 59.5 * 60 },
        ],
      });

      if (timeWord !== "just now") {
        timeWord += " " + word;
      }
      //@ts-ignore
      return timeWord;
    }
}
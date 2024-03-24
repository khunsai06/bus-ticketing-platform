import moment from "moment";

export namespace DatetimeLib {
  export function getHourDifference(
    startIsoString: string,
    endIsoString: string
  ): number {
    const startMoment = moment(startIsoString);
    const endMoment = moment(endIsoString);
    const hourDifference = endMoment.diff(startMoment, "hours");
    return hourDifference;
  }

  export function formatDateForDisplay(isoString: string): string {
    return moment(isoString).format("MMM DD, hh:mm A");
  }

  export function extractTimeForDisplay(isoString: string): string {
    return moment(isoString).format("hh:mm A");
  }

  export function convertIsoToDatetimeLocal(isoString: string) {
    return moment(isoString).format("YYYY-MM-DDTHH:mm");
  }
}

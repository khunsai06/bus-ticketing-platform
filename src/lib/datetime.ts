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
    return moment(isoString).format("MMM DD, YYYY hh:mm A");
  }

  export function extractTimeForDisplay(isoString: string): string {
    return moment(isoString).format("hh:mm A");
  }

  export function convertIsoToDatetimeLocal(isoString: string) {
    return moment(isoString).format("YYYY-MM-DDTHH:mm");
  }

  export function latestDate16YearsAgo() {
    return moment().subtract(16, "years").format("YYYY-MM-DD");
  }
  export function calculateCancellationTime(
    bookedAt: string,
    refundTimeFrame: number
  ) {
    const bookedTime = moment(bookedAt);
    const currentTime = moment();
    const timeDifferenceInMinutes = currentTime.diff(bookedTime, "minutes");
    const timeLeftForCancellation = refundTimeFrame - timeDifferenceInMinutes;
    const hoursLeft = Math.floor(timeLeftForCancellation / 60);
    const minutesLeft = timeLeftForCancellation % 60;
    return {
      hours: hoursLeft,
      minutes: minutesLeft,
    };
  }
}

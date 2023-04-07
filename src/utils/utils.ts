export const convertTimeToMilliseconds = (timeString: string): number => {
    const timeValue = parseInt(timeString.slice(0, -1), 10);
    const timeUnit = timeString.slice(-1);
  
    switch (timeUnit) {
      case 'm':
        return timeValue * 60 * 1000 ;
      case 'h':
        return timeValue * 60 * 60 * 1000 ;
      default:
        throw new Error(`Invalid time unit: ${timeUnit}`);
    }
  }
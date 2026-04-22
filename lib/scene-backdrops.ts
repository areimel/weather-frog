export function getSceneBackdrop(frogCode: string): string {
  switch (frogCode) {
    case "01":
    case "02":
      return "#4ea3c8";
    case "03":
    case "04":
      return "#6b8ea5";
    case "05":
    case "06":
      return "#1e2a4a";
    case "07":
    case "08":
      return "#2a3350";
    case "09":
      return "#5a6673";
    case "10":
    case "11":
    case "12":
      return "#4a5a6b";
    case "13":
    case "15":
    case "16":
    case "17":
    case "20":
      return "#7a8a9a";
    case "19":
      return "#606c78";
    case "22":
    case "24":
      return "#2e3340";
    case "25":
      return "#8ba6b8";
    case "26":
      return "#8a8e90";
    default:
      return "#4ea3c8";
  }
}

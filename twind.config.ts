import { Options } from "$fresh/plugins/twind.ts";
import * as colors from "twind/colors";

export default {
  selfURL: import.meta.url,
  // preflight: false,
  theme: {
    colors: {
      black: colors.black,
      "blue-gray": colors.blueGray,
      gray: colors.gray,
      red: colors.red,
      white: colors.white
    },
    container: {
      center: true
    }
  }
} as Options;

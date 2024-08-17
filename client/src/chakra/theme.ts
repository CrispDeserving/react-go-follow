import { ChakraTheme, extendTheme, type ThemeConfig } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";

const config: ThemeConfig = {
  initialColorMode: "light",
  useSystemColorMode: true,
};

// 3. extend the theme
const theme = extendTheme({
  config,
  styles: {
    global: (props: ChakraTheme) => ({
      body: {
        backgroundColor: mode("gray.50", "")(props),
      },
    }),
  },
});

export default theme;

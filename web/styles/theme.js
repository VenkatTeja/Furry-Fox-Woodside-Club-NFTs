import { createTheme, responsiveFontSizes } from "@mui/material/styles";

// Create a theme instance.
let theme = createTheme({
  // customize your theme here
  palette: {
    primary: {
      main: '#F3C830',
    },
    secondary: {
      main: '#040404',
    },
    text: {
      primary: '#D98D3E',
      secondary: '#C2B9B7'
    }
  },
});

theme = responsiveFontSizes(theme);

export default theme;

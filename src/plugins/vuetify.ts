/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com
 */

// Styles
import "@mdi/font/css/materialdesignicons.css";
import "vuetify/styles";

// Composables
import { createVuetify } from "vuetify";

// Blueprints
import { md3 } from "vuetify/blueprints";

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          primary: "#6200EA", // Deep Purple A700
          secondary: "#00BFA5", // Teal A700
          background: "#F8F9FA",
          surface: "#FFFFFF",
        },
      },
    },
  },
  defaults: {
    VCard: {
      elevation: 0,
      rounded: "lg",
      variant: "flat",
      border: true,
    },
    VBtn: {
      rounded: "lg",
      variant: "flat",
      height: 44,
    },
    VTextField: {
      variant: "outlined",
      density: "comfortable",
      color: "primary",
      hideDetails: "auto",
    },
    VTextarea: {
      variant: "outlined",
      density: "comfortable",
      color: "primary",
      hideDetails: "auto",
    },
  },
  blueprint: md3,
});

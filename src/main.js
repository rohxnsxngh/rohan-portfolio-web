import { createApp } from "vue";
import "./style.css";
import "./index.css";
import App from "./App.vue";
import { inject } from '@vercel/analytics';

createApp(App).mount("#app");
inject();
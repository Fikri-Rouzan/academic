// src/main.js

import { createApp } from 'vue'
import { createPinia } from 'pinia' 
import App from './App.vue'
import router from './router'      
import './style.css'               

const app = createApp(App)

// Memberitahu Vue untuk menggunakan Pinia dan Router
app.use(createPinia()) 
app.use(router)      

app.mount('#app')
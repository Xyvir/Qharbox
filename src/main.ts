import './app.css';
import App from './App.svelte';
import { mount } from 'svelte';

const target = document.getElementById('app');

if (!target) {
  throw new Error("Could not find target element with id 'app'");
}

const app = mount(App, {
  target,
});

export default app;

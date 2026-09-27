import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './base.css'
import './site.css'
import App from './App.jsx'

const container = document.getElementById('root')

/*
 * React listens at its root for every event it supports, including `animationiteration`.
 * Nothing on this site uses that event, but in Chrome one listener for it anywhere in the
 * document makes every running CSS animation wake the main thread about six times a second
 * so the event could be delivered. The illustrations loop while they are on screen, so that
 * unused listener was most of the site's idle main-thread work. It is skipped only while
 * React attaches its root listeners. (Remove this if a component ever needs
 * `onAnimationIteration`.)
 */
const addEventListener = EventTarget.prototype.addEventListener
EventTarget.prototype.addEventListener = function add(type, ...rest) {
  if (this === container && type === 'animationiteration') return undefined
  return addEventListener.call(this, type, ...rest)
}
const root = createRoot(container)
EventTarget.prototype.addEventListener = addEventListener

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)

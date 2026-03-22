import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import EETIToolkit from './eeti-toolkit'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EETIToolkit />
  </StrictMode>
)

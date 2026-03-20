import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import EETIToolkit from './EETIToolkit'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EETIToolkit />
  </StrictMode>
)

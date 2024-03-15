import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import NearestStopes from './components/NearestStopes.jsx'
// import BusTracker from './Components/BusRoutes.jsx'
// import GetStops from './Components/GetStops.jsx'
// import BusMap from './Components/BusDirection.jsx'

// import Bus from './Components/Bus.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      {/* <Route path='/' element={<BusTracker />} /> */}
      {/* <Route path='/' element={<Bus />} /> */}

      {/* <Route path='/' element={<GetStops />} /> */}
      {/* <Route path='/' element={<BusMap />} /> */}
      <Route path='/' element={<NearestStopes />} />
    </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* <App /> */}
    <RouterProvider router={router} />
  </React.StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
// import StopsData from './components/NearestStopes.jsx'
// import StopsData from './components/Map.jsx'
import StopsData from './components/StopsData.jsx'
// import BusesDetails from './components/NearestStopBackUp.jsx'

// import NearestStopes from './components/NearestStopes.jsx'


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path='/' element={<StopsData />} />
      {/* <Route path='/buses' element={<BusesDetails />} /> */}
      {/* <Route path='/near' element={<StopsData />} /> */}
    </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* <App /> */}
    <RouterProvider router={router} />
  </React.StrictMode>,
)

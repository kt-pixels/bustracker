import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import StopsData from './components/StopsData.jsx'
import NearestStopes from './components/NearestStopes.jsx'


const router = createBrowserRouter(
  createRoutesFromElements(
    <Route>
      <Route path='/' element={<StopsData />} />
      <Route path='/near' element={<NearestStopes />} />
    </Route>
  )
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* <App /> */}
    <RouterProvider router={router} />
  </React.StrictMode>,
)

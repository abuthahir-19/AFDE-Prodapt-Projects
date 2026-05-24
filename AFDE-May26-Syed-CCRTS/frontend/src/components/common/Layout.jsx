import React from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">{children}</main>
      </div>
    </div>
  )
}

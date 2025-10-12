import React from 'react'

const Footer = () => {
  return (
    <div className="bg-gray-800 text-white py-4">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-sm">
          &copy; {new Date().getFullYear()} manage Money. Made with Passion.
        </p>
      </div>
    </div>
  )
}

export default Footer
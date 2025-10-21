export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-600">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}
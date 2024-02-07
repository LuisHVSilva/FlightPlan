import FlightPlan from "./components/FlightPlan"

// Sass
import './style/main.sass'

// Context
import { DisplayOptionProvider } from "./context/DisplayOptionContext"

function App() {

  return (
    <>
      <DisplayOptionProvider>
        <FlightPlan />
      </DisplayOptionProvider>
    </>
  )
}

export default App

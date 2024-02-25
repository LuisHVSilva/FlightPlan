import FlightPlan from "./components/FlightPlan"

// Sass
import './style/main.sass'

// Context
import { DisplayOptionProvider } from "./context/DisplayOptionContext"
import { RouteDetailsProvider } from "./context/RouteDetailsCountext"

function App() {

  return (
    <>
      <DisplayOptionProvider>
        <RouteDetailsProvider>
          <FlightPlan />
        </RouteDetailsProvider>
      </DisplayOptionProvider>
    </>
  )
}

export default App

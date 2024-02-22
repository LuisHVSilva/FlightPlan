import FlightPlan from "./components/FlightPlan"

// Sass
import './style/main.sass'

// Context
import { DisplayOptionProvider } from "./context/DisplayOptionContext"
import { ChosenRouteProvider } from "./context/ChosenRouteContext"

function App() {

  return (
    <>
      <ChosenRouteProvider>
        <DisplayOptionProvider>
          <FlightPlan />
        </DisplayOptionProvider>
      </ChosenRouteProvider>
    </>
  )
}

export default App

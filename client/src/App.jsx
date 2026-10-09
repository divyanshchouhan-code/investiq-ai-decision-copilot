import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";

import Landing from "./pages/Landing/Landing";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import InvestmentSpace from "./pages/InvestmentSpace/InvestmentSpace";
import Onboarding from "./pages/Onboarding/Onboarding";

import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
    return (
         <BrowserRouter>
            <Routes>
                {/* Public pages */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* Protected pages */}
                <Route element={<ProtectedRoute />}>
                    <Route
                        path="/onboarding"
                        element={<Onboarding />}
                    />

                    <Route
                        path="/investment-space"
                        element={<InvestmentSpace />}
                    />
                </Route>

                {/* Unknown routes */}
                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
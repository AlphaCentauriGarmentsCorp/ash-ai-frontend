import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import "./index.css";
import Login from "./pages/Auth/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import AddEmployeeAccount from "./pages/Accounts/AddNewAccount";
import AllEmployeeAccount from "./pages/Accounts/AllAccount";
import AddNewClient from "./pages/Clients/AddNewClient";
import AllClients from "./pages/Clients/AllClient";
import ViewClient from "./pages/Clients/ViewClient";
import EditClient from "./pages/Clients/EditClient";
import AddNewOrder from "./pages/Orders/AddNewOrder";
import AllOrders from "./pages/Orders/AllOrders";
import OrderDetails from "./pages/Orders/OrderDetails";
import PatternType from "./pages/DropDownSettings/PatternType/PatternType";
import AddPatternType from "./pages/DropDownSettings/PatternType/AddPatternType";
import EditPatternType from "./pages/DropDownSettings/PatternType/EditPatternType";
import ApparelType from "./pages/DropDownSettings/ApparelType/ApparelType";
import AddApparelType from "./pages/DropDownSettings/ApparelType/AddApparelType";
import EditApparelType from "./pages/DropDownSettings/ApparelType/EditApparelType";
import ServiceTypeList from "./pages/DropDownSettings/ServiceType/ServiceType";
import AddServiceType from "./pages/DropDownSettings/ServiceType/AddServiceType";
import EditServiceType from "./pages/DropDownSettings/ServiceType/EditServiceType";
import PrintMethod from "./pages/DropDownSettings/PrintMethod/PrintMethod";
import AddPrintMethod from "./pages/DropDownSettings/PrintMethod/AddPrintMethod";
import EditPrintMethod from "./pages/DropDownSettings/PrintMethod/EditPrintMethod";
import SizeLabel from "./pages/DropDownSettings/SizeLabel/SizeLabel";
import AddSizeLabel from "./pages/DropDownSettings/SizeLabel/AddSizeLabel";
import EditSizeLabel from "./pages/DropDownSettings/SizeLabel/EditSizeLabel";
import PrintLabelPlacement from "./pages/DropDownSettings/PrintLabelPlacements/PrintLabelPlacement";
import AddPrintLabelPlacement from "./pages/DropDownSettings/PrintLabelPlacements/AddPrintLabelPlacement";
import FreebiesPage from "./pages/DropDownSettings/Freebies/Freebies";
import AddFreebie from "./pages/DropDownSettings/Freebies/AddFreebie";
import PlacementMeasurementsPage from "./pages/DropDownSettings/PlacementMeasurements/PlacementMeasurements";
import AddPlacementMeasurement from "./pages/DropDownSettings/PlacementMeasurements/AddPlacementMeasurement";
import AdditionalOptionsPage from "./pages/DropDownSettings/AdditionalOptions/AdditionalOptions";
import AddAdditionalOption from "./pages/DropDownSettings/AdditionalOptions/AddAdditionalOption";

import EditPrintLabelPlacement from "./pages/DropDownSettings/PrintLabelPlacements/EditPrintLabelPlacement";
import EquipmentLocations from "./pages/EquipmentInventory/Locations/EquipmentLocations";
import AddLocation from "./pages/EquipmentInventory/Locations/AddLocation";
import EditLocation from "./pages/EquipmentInventory/Locations/EditLocation";
import AddEquipment from "./pages/EquipmentInventory/Equipments/AddEquipment";
import EditEquipment from "./pages/EquipmentInventory/Equipments/EditEquipment";
import ViewEquipment from "./pages/EquipmentInventory/Equipments/ViewEquipment";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import EquipmentInventory from "./pages/EquipmentInventory/Equipments/EquipmentInventory";
import Suppliers from "./pages/Supplier/AllSupplier";
import AddSupplier from "./pages/Supplier/AddSupplier";
import EditSupplier from "./pages/Supplier/EditSupplier";
import ViewSupplier from "./pages/Supplier/ViewSupplier";
import AllMaterials from "./pages/Materials/AllMaterials";
import AddMaterials from "./pages/Materials/AddMaterials";
import AddScreen from "./pages/ScreenInventory/AddScreen";
import AllScreen from "./pages/ScreenInventory/AllScreen";
import EditScreen from "./pages/ScreenInventory/EditScreen";

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary dark:bg-dark-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-15 w-15 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipment-inventory"
          element={
            <ProtectedRoute>
              <EquipmentLocations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipment-inventory/new"
          element={
            <ProtectedRoute>
              <AddLocation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipment-inventory/equipment/add"
          element={
            <ProtectedRoute>
              <AddEquipment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipment-inventory/equipment/:id/edit"
          element={
            <ProtectedRoute>
              <EditEquipment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipment-inventory/equipment/:id/view"
          element={
            <ProtectedRoute>
              <ViewEquipment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipment-inventory/edit/:id"
          element={
            <ProtectedRoute>
              <EditLocation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/equipment-inventory/:id/contents"
          element={
            <ProtectedRoute>
              <EquipmentInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <AllOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/new"
          element={
            <ProtectedRoute>
              <AddNewOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order/:po_code"
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/employee"
          element={
            <ProtectedRoute>
              <AllEmployeeAccount />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/employee/new"
          element={
            <ProtectedRoute>
              <AddEmployeeAccount />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <ProtectedRoute>
              <AllClients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients/new"
          element={
            <ProtectedRoute>
              <AddNewClient />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients/view/:id"
          element={
            <ProtectedRoute>
              <ViewClient />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients/edit/:id"
          element={
            <ProtectedRoute>
              <EditClient />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/pattern-type"
          element={
            <ProtectedRoute>
              <PatternType />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/pattern-type/new"
          element={
            <ProtectedRoute>
              <AddPatternType />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/pattern-type/edit/:id"
          element={
            <ProtectedRoute>
              <EditPatternType />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/apparel-type"
          element={
            <ProtectedRoute>
              <ApparelType />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/apparel-type/new"
          element={
            <ProtectedRoute>
              <AddApparelType />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/apparel-type/edit/:id"
          element={
            <ProtectedRoute>
              <EditApparelType />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/service-type"
          element={
            <ProtectedRoute>
              <ServiceTypeList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/service-type/new"
          element={
            <ProtectedRoute>
              <AddServiceType />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/service-type/edit/:id"
          element={
            <ProtectedRoute>
              <EditServiceType />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/print-method"
          element={
            <ProtectedRoute>
              <PrintMethod />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/print-method/new"
          element={
            <ProtectedRoute>
              <AddPrintMethod />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/print-method/edit/:id"
          element={
            <ProtectedRoute>
              <EditPrintMethod />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/size-label"
          element={
            <ProtectedRoute>
              <SizeLabel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/size-label/new"
          element={
            <ProtectedRoute>
              <AddSizeLabel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/size-label/edit/:id"
          element={
            <ProtectedRoute>
              <EditSizeLabel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/print-label-placements"
          element={
            <ProtectedRoute>
              <PrintLabelPlacement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/print-label-placements/new"
          element={
            <ProtectedRoute>
              <AddPrintLabelPlacement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/print-label-placements/edit/:id"
          element={
            <ProtectedRoute>
              <EditPrintLabelPlacement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings/freebies"
          element={
            <ProtectedRoute>
              <FreebiesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings/freebies/new"
          element={
            <ProtectedRoute>
              <AddFreebie />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings/placement-measurements"
          element={
            <ProtectedRoute>
              <PlacementMeasurementsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings/placement-measurements/new"
          element={
            <ProtectedRoute>
              <AddPlacementMeasurement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings/additional-options"
          element={
            <ProtectedRoute>
              <AdditionalOptionsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/settings/additional-options/new"
          element={
            <ProtectedRoute>
              <AddAdditionalOption />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier"
          element={
            <ProtectedRoute>
              <Suppliers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/new"
          element={
            <ProtectedRoute>
              <AddSupplier />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/:id/edit"
          element={
            <ProtectedRoute>
              <EditSupplier />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/:id/view"
          element={
            <ProtectedRoute>
              <ViewSupplier />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/materials"
          element={
            <ProtectedRoute>
              <AllMaterials />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/materials/new"
          element={
            <ProtectedRoute>
              <AddMaterials />
            </ProtectedRoute>
          }
        />
        <Route
          path="/screen-inventory/new"
          element={
            <ProtectedRoute>
              <AddScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/screen-inventory"
          element={
            <ProtectedRoute>
              <AllScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/screen-inventory/:id/edit"
          element={
            <ProtectedRoute>
              <EditScreen />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

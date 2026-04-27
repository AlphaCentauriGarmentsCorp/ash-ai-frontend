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
import ApparelParts from "./pages/DropDownSettings/ApparelParts/ApparelParts";
import AddApparelParts from "./pages/DropDownSettings/ApparelParts/AddApparelParts";
import EditApparelParts from "./pages/DropDownSettings/ApparelParts/EditApparelParts";
import ServiceTypeList from "./pages/DropDownSettings/ServiceType/ServiceType";
import AddServiceType from "./pages/DropDownSettings/ServiceType/AddServiceType";
import EditServiceType from "./pages/DropDownSettings/ServiceType/EditServiceType";
import PrintMethod from "./pages/DropDownSettings/PrintMethod/PrintMethod";
import AddPrintMethod from "./pages/DropDownSettings/PrintMethod/AddPrintMethod";
import EditPrintMethod from "./pages/DropDownSettings/PrintMethod/EditPrintMethod";
import SizeLabel from "./pages/DropDownSettings/SizeLabel/SizeLabel";
import AddSizeLabel from "./pages/DropDownSettings/SizeLabel/AddSizeLabel";
import EditSizeLabel from "./pages/DropDownSettings/SizeLabel/EditSizeLabel";
import Courier from "./pages/DropDownSettings/Courier/Courier";
import AddCourier from "./pages/DropDownSettings/Courier/AddCourier";
import EditCourier from "./pages/DropDownSettings/Courier/EditCourier";
import SewingSubcontractor from "./pages/DropDownSettings/SewingSubcontractor/SewingSubcontractor";
import AddSewingSubcontractor from "./pages/DropDownSettings/SewingSubcontractor/AddSewingSubcontractor";
import EditSewingSubcontractor from "./pages/DropDownSettings/SewingSubcontractor/EditSewingSubcontractor";
import PaymentMethods from "./pages/DropDownSettings/PaymentMethods/PaymentMethods";
import AddPaymentMethods from "./pages/DropDownSettings/PaymentMethods/AddPaymentMethods";
import EditPaymentMethods from "./pages/DropDownSettings/PaymentMethods/EditPaymentMethods";
import ShippingMethods from "./pages/DropDownSettings/ShippingMethods/ShippingMethods";
import AddShippingMethods from "./pages/DropDownSettings/ShippingMethods/AddShippingMethods";
import EditShippingMethods from "./pages/DropDownSettings/ShippingMethods/EditShippingMethods";
import PrintLabelPlacement from "./pages/DropDownSettings/PrintLabelPlacements/PrintLabelPlacement";
import AddPrintLabelPlacement from "./pages/DropDownSettings/PrintLabelPlacements/AddPrintLabelPlacement";
import FreebiesPage from "./pages/DropDownSettings/Freebies/Freebies";
import AddFreebie from "./pages/DropDownSettings/Freebies/AddFreebie";
import EditFreebie from "./pages/DropDownSettings/Freebies/EditFreebie";
import PlacementMeasurementsPage from "./pages/DropDownSettings/PlacementMeasurements/PlacementMeasurements";
import AddPlacementMeasurement from "./pages/DropDownSettings/PlacementMeasurements/AddPlacementMeasurement";
import EditPlacementMeasurement from "./pages/DropDownSettings/PlacementMeasurements/EditPlacementMeasurement";
import AdditionalOptionsPage from "./pages/DropDownSettings/AdditionalOptions/AdditionalOptions";
import AddAdditionalOption from "./pages/DropDownSettings/AdditionalOptions/AddAdditionalOption";
import EditAdditionalOption from "./pages/DropDownSettings/AdditionalOptions/EditAdditionalOption";

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
import Quotation from "./pages/Quotation/Quotation";


import AddonCategoriesPage from "./pages/QuotationSettings/AddonCategories/AddonCategoriesPage";
import AddAddonCategories from "./pages/QuotationSettings/AddonCategories/AddAddonCategories";
import EditAddonCategories from "./pages/QuotationSettings/AddonCategories/EditAddonCategories";


import AddonsPage from "./pages/QuotationSettings/Addons/AddonsPage";
import AddAddons from "./pages/QuotationSettings/Addons/AddAddons";
import EditAddons from "./pages/QuotationSettings/Addons/EditAddons";
import ApparelNecklinePage from "./pages/QuotationSettings/ApparelNeckline/ApparelNecklinePage";
import AddApparelNeckline from "./pages/QuotationSettings/ApparelNeckline/AddApparelNeckline";
import EditApparelNeckline from "./pages/QuotationSettings/ApparelNeckline/EditApparelNeckline";
import ApparelPatternPricesPage from "./pages/QuotationSettings/ApparelPatternPrices/ApparelPatternPricesPage";
import AddApparelPatternPrices from "./pages/QuotationSettings/ApparelPatternPrices/AddApparelPatternPrices";
import EditApparelPatternPrices from "./pages/QuotationSettings/ApparelPatternPrices/EditApparelPatternPrices";

import AllQuotation from "./pages/Quotation/AllQuotation";
import ViewQuotation from "./pages/Quotation/ViewQuotation";
import EditQuotation from "./pages/Quotation/EditQuotation";
import QuotationClient from "./pages/Quotation/QuotationClient";
import RolesPage from "./pages/RBAC/Roles/RolesPage";
import AddRole from "./pages/RBAC/Roles/AddRole";
import EditRole from "./pages/RBAC/Roles/EditRole";
import PermissionsPage from "./pages/RBAC/Permissions/PermissionsPage";
import AddPermission from "./pages/RBAC/Permissions/AddPermission";
import EditPermission from "./pages/RBAC/Permissions/EditPermission";
import RolePermissionMatrix from "./pages/RBAC/RolePermissionMatrix";

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
          path="/quotation-client"
          element={<QuotationClient />}
        />
        <Route
          path="/share/quotations/:token"
          element={<QuotationClient />}
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
          path="/admin/settings/apparel-parts"
          element={
            <ProtectedRoute>
              <ApparelParts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/apparel-parts/new"
          element={
            <ProtectedRoute>
              <AddApparelParts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/apparel-parts/edit/:id"
          element={
            <ProtectedRoute>
              <EditApparelParts />
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
          path="/admin/settings/courier"
          element={
            <ProtectedRoute>
              <Courier />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/courier/new"
          element={
            <ProtectedRoute>
              <AddCourier />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/courier/edit/:id"
          element={
            <ProtectedRoute>
              <EditCourier />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/sewing-subcontractor"
          element={
            <ProtectedRoute>
              <SewingSubcontractor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/sewing-subcontractor/new"
          element={
            <ProtectedRoute>
              <AddSewingSubcontractor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/sewing-subcontractor/edit/:id"
          element={
            <ProtectedRoute>
              <EditSewingSubcontractor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/payment-methods"
          element={
            <ProtectedRoute>
              <PaymentMethods />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/payment-methods/new"
          element={
            <ProtectedRoute>
              <AddPaymentMethods />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/payment-methods/edit/:id"
          element={
            <ProtectedRoute>
              <EditPaymentMethods />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/shipping-methods"
          element={
            <ProtectedRoute>
              <ShippingMethods />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/shipping-methods/new"
          element={
            <ProtectedRoute>
              <AddShippingMethods />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings/shipping-methods/edit/:id"
          element={
            <ProtectedRoute>
              <EditShippingMethods />
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
          path="/admin/settings/freebies/edit/:id"
          element={
            <ProtectedRoute>
              <EditFreebie />
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
          path="/admin/settings/placement-measurements/edit/:id"
          element={
            <ProtectedRoute>
              <EditPlacementMeasurement />
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
          path="/admin/settings/additional-options/edit/:id"
          element={
            <ProtectedRoute>
              <EditAdditionalOption />
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
         <Route
          path="/quotations"
          element={
            <ProtectedRoute>
              <AllQuotation />
            </ProtectedRoute>
          }
        />
         <Route
          path="/quotations/view/:id"
          element={
            <ProtectedRoute>
              <ViewQuotation />
            </ProtectedRoute>
          }
        />
         <Route
          path="/quotations/edit/:id"
          element={
            <ProtectedRoute>
              <EditQuotation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotations/new"
          element={
            <ProtectedRoute>
              <Quotation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotation/settings/addon-categories"
          element={
            <ProtectedRoute>
              <AddonCategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotation/settings/addon-categories/new"
          element={
            <ProtectedRoute>
              <AddAddonCategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotation/settings/addon-categories/edit/:id"
          element={
            <ProtectedRoute>
              <EditAddonCategories />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotation/settings/addons"
          element={
            <ProtectedRoute>
              <AddonsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quotation/settings/addons/new"
          element={
            <ProtectedRoute>
              <AddAddons />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quotation/settings/addons/edit/:id"
          element={
            <ProtectedRoute>
              <EditAddons />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotation/settings/apparel-neckline"
          element={
            <ProtectedRoute>
              <ApparelNecklinePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotation/settings/apparel-neckline/new"
          element={
            <ProtectedRoute>
              <AddApparelNeckline />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotation/settings/apparel-neckline/edit/:id"
          element={
            <ProtectedRoute>
              <EditApparelNeckline />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotation/settings/apparel-pattern-prices"
          element={
            <ProtectedRoute>
              <ApparelPatternPricesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotation/settings/apparel-pattern-prices/new"
          element={
            <ProtectedRoute>
              <AddApparelPatternPrices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotation/settings/apparel-pattern-prices/edit/:id"
          element={
            <ProtectedRoute>
              <EditApparelPatternPrices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rbac/roles"
          element={
            <ProtectedRoute
              requiredPermissions={["access.rbac"]}
            >
              <RolesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rbac/roles/new"
          element={
            <ProtectedRoute
              requiredPermissions={["access.rbac"]}
            >
              <AddRole />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rbac/roles/edit/:id"
          element={
            <ProtectedRoute
              requiredPermissions={["access.rbac"]}
            >
              <EditRole />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rbac/permissions"
          element={
            <ProtectedRoute
              requiredPermissions={["access.rbac"]}
            >
              <PermissionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rbac/permissions/new"
          element={
            <ProtectedRoute
              requiredPermissions={["access.rbac"]}
            >
              <AddPermission />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rbac/permissions/edit/:id"
          element={
            <ProtectedRoute
              requiredPermissions={["access.rbac"]}
            >
              <EditPermission />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rbac/matrix"
          element={
            <ProtectedRoute
              requiredPermissions={["access.rbac"]}
            >
              <RolePermissionMatrix />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

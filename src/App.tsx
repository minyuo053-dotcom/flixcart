import { Routes, Route } from 'react-router'
import { CartProvider } from './contexts/CartContext'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Shop from './pages/Shop'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import VerifyOtp from './pages/VerifyOtp'
import Wallet from './pages/Wallet'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import SellerDashboard from './pages/SellerDashboard'
import ProductChat from './pages/ProductChat'

export default function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success/:orderId" element={<OrderSuccess />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/seller" element={<SellerDashboard />} />
        <Route path="/product-chat/:productId" element={<ProductChat />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </CartProvider>
  )
}

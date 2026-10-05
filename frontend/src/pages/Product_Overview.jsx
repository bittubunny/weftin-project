import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Heart, User, Star, ChevronDown, ChevronUp } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://weftin-project.onrender.com";

export default function Product_Overview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('Standard Length');
  const [selectedColor, setSelectedColor] = useState('gold');
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  
  const [descOpen, setDescOpen] = useState(true);
  const [materialOpen, setMaterialOpen] = useState(false);
  const [shippingOpen, setShippingOpen] = useState(false);
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        const found = data.find(item => item.id.toString() === id) || data[0];
        setProduct(found);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading product overview:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading || !product) {
    return <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-xs uppercase tracking-widest text-gray-500">Loading product overview...</div>;
  }

  // Build images array securely, using image2/3/4 if available, otherwise fallback intelligently
  const productImages = [
    product.image,
    product.image2 || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800",
    product.image3 || "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800",
    product.image4 || "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800"
  ].filter(Boolean); // removes any null/undefined entries

  const relatedMasterpieces = [
    { id: 1, name: 'Midnight Indigo Silk Saree', price: '₹12,250', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=500' },
    { id: 2, name: 'Crimson Velvet Bridal Lehenga', price: '₹24,800', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=500' },
  ];
  const handleAddToBag = () => {
    // Get existing cart from localStorage or start empty
    const existingCart = JSON.parse(localStorage.getItem('weftin_cart')) || [];
    
    // Check if this item is already in cart
    const existingIndex = existingCart.findIndex(item => item.id === product.id && item.size === selectedSize && item.shade === selectedColor);
    
    if (existingIndex > -1) {
      existingCart[existingIndex].qty += quantity;
    } else {
      existingCart.push({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price, // keeps string format e.g. "₹8,999"
        size: selectedSize,
        shade: selectedColor,
        qty: quantity,
        image: product.image,
        tag: product.tag || 'ATELIER'
      });
    }

    localStorage.setItem('weftin_cart', JSON.stringify(existingCart));
    setCartCount(existingCart.reduce((acc, i) => acc + i.qty, 0));
    showToast(`Added ${product.name} to Luxury Bag!`);
  };
  const handleBespokeCustomDesign = async () => {
  const savedUser = JSON.parse(localStorage.getItem("weftin_user"));

  if (!savedUser?.email) {
    showToast("Please sign in before creating a custom design.");
    navigate("/profile");
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/custom-designs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_email: savedUser.email,
          product_id: product.id,
          product_name: product.name,
          product_category: product.category,
          product_price: product.price,
          product_image: product.image
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Failed to create custom design");
    }

    showToast("Bespoke custom design request created!");

    setTimeout(() => {
      navigate("/custom-designs");
    }, 500);

  } catch (error) {
    console.error("Custom design error:", error);
    showToast("Unable to create custom design request.");
  }
};


  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl text-sm animate-fade-in flex items-center gap-3 border border-amber-500/30">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          {toastMessage}
        </div>
      )}

      {/* TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#1C1816] text-[#E5D5BC] text-xs py-2 text-center tracking-[0.2em] uppercase font-medium">
        LIMITED FESTIVE EDIT — 20% OFF SELECTED COUTURE PIECES
      </div>

      {/* NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-gray-200 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden lg:flex items-center bg-gray-100 rounded-full px-4 py-2 w-64 border border-gray-200">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input type="text" placeholder="Search anything..." className="bg-transparent text-xs text-gray-800 focus:outline-none w-full" />
          </div>

          <div className="text-center">
            <h1 className="font-serif text-2xl tracking-[0.25em] font-bold text-gray-900">WEFTIN</h1>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-xs font-medium text-gray-700 cursor-pointer">INR &or;</span>
            <Link to="/profile" className="text-gray-800 hover:text-black">
              <Heart className="w-5 h-5" />
            </Link>
            <Link to="/profile" className="text-gray-800 hover:text-black">
              <User className="w-5 h-5" />
            </Link>
            <Link to="/cart" className="relative text-gray-800 hover:text-black">
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && <span className="absolute -top-1 -right-2 bg-amber-700 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cartCount}</span>}
            </Link>
          </div>
        </div>

        {/* Sub Nav Links */}
        <nav className="hidden md:flex justify-center items-center gap-8 mt-4 pt-3 border-t border-gray-200/60 text-xs tracking-[0.15em] uppercase text-gray-700 font-medium">
          <Link to="/" className="hover:text-black transition-colors">Home</Link>
          <Link to="/shop" className="hover:text-black transition-colors">Shop</Link>
          <a href="#" className="hover:text-black transition-colors">Collections</a>
          <a href="#" className="hover:text-black transition-colors">Custom Design</a>
          <Link to="/lookbook" className="hover:text-black transition-colors">Lookbook</Link>
          <Link to="/limited" className="hover:text-black transition-colors">Limited Edition</Link>
        </nav>
      </header>

      {/* BREADCRUMB */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 text-xs text-gray-500">
        <Link to="/" className="hover:underline">Home</Link> <span className="mx-2">/</span> 
        <Link to="/shop" className="hover:underline">Shop</Link> <span className="mx-2">/</span> 
        <span className="text-gray-800">{product.category}</span> <span className="mx-2">/</span> 
        <span className="text-gray-900 font-semibold">{product.name}</span>
      </div>

      {/* PRODUCT OVERVIEW SECTION */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 pb-24">
        <div className="bg-white p-8 lg:p-12 rounded-2xl border border-gray-200 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left: Thumbnail Selector + Main Image */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex sm:flex-col gap-3 order-2 sm:order-1 overflow-x-auto">
              {productImages.map((img, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-24 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${selectedImage === idx ? 'border-amber-700 shadow-md scale-105' : 'border-gray-200 opacity-70 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Main Featured Image */}
            <div className="relative flex-1 h-[520px] rounded-xl overflow-hidden bg-gray-100 order-1 sm:order-2">
              <span className="absolute top-3 left-3 z-10 bg-[#D4AF37] text-black text-[9px] uppercase tracking-widest px-3 py-1 font-bold">
                {product.tag || 'ATELIER DROP'}
              </span>
              <img src={productImages[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Right: Product Details & Purchase Panel */}
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">{product.category} • SKU: {product.sku || 'WFT-SR-1042'}</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full">In Stock & Ready</span>
            </div>

            <h2 className="text-3xl lg:text-4xl font-serif font-light text-gray-900 mb-3">{product.name}</h2>
            
            {/* Reviews */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-500" />)}
              </div>
              <span className="text-xs text-gray-500">(24 verified reviews)</span>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-4 mb-6 pb-6 border-b border-gray-100">
              <span className="text-3xl font-bold text-gray-950">{product.price}</span>
              {product.old_price && <span className="text-sm text-gray-400 line-through">{product.old_price}</span>}
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-8">
              {product.description || 'Woven with pure gold-coated zari thread and premium mulberry silk, this magnificent masterpiece encapsulates heritage Indian craftsmanship in a rich, breathtaking drape.'}
            </p>

            {/* Select Sizing */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs uppercase tracking-wider text-gray-600 font-semibold">Select Tailoring Size</label>
                <button onClick={() => showToast('Opening size chart...')} className="text-xs text-amber-700 underline font-medium">Size Chart & Guide</button>
              </div>
              <div className="flex gap-3">
                {['S', 'M', 'L', 'Standard Length'].map(sz => (
                  <button 
                    key={sz} 
                    onClick={() => setSelectedSize(sz)}
                    className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded border transition-all ${selectedSize === sz ? 'bg-black text-white border-black' : 'border-gray-300 text-gray-700 hover:border-black'}`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Palette */}
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-wider text-gray-600 font-semibold mb-2">Color Palette</label>
              <div className="flex gap-3 items-center">
                {[
                  { name: 'gold', bg: 'bg-amber-600' },
                  { name: 'ruby', bg: 'bg-rose-900' },
                  { name: 'emerald', bg: 'bg-emerald-800' }
                ].map(c => (
                  <button 
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`w-8 h-8 rounded-full ${c.bg} transition-transform ${selectedColor === c.name ? 'ring-4 ring-black scale-110' : 'opacity-70 hover:opacity-100'}`}
                  />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <label className="block text-xs uppercase tracking-wider text-gray-600 font-semibold mb-2">Quantity</label>
              <div className="flex items-center w-32 border border-gray-300 rounded bg-gray-50">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-gray-600 hover:text-black font-bold">-</button>
                <span className="flex-1 text-center text-sm font-semibold">{quantity}</span>
                <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 text-gray-600 hover:text-black font-bold">+</button>
              </div>
            </div>

        {/* Action Buttons */}
  <div className="space-y-3 mb-8">
    <button 
      onClick={() => {
        const existingCart = JSON.parse(localStorage.getItem('weftin_cart')) || [];
        
        const existingIndex = existingCart.findIndex(
          item => item.id === product.id && item.size === selectedSize && item.shade === selectedColor
        );
        
        if (existingIndex > -1) {
          existingCart[existingIndex].qty += quantity;
        } else {
          existingCart.push({
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            size: selectedSize,
            shade: selectedColor,
            qty: quantity,
            image: product.image,
            tag: product.tag || 'ATELIER'
          });
        }

        localStorage.setItem('weftin_cart', JSON.stringify(existingCart));
        setCartCount(existingCart.reduce((acc, i) => acc + i.qty, 0));
        showToast(`Added ${quantity}x ${product.name} to Luxury Bag!`);
      }} 
      className="w-full bg-[#1C1816] hover:bg-black text-white py-4 rounded text-xs uppercase tracking-[0.2em] font-semibold shadow-lg"
    >
      Add To Luxury Bag
    </button>
    <button onClick={() => showToast('Redirecting to express checkout...')} className="w-full border-2 border-black text-black py-3.5 rounded text-xs uppercase tracking-[0.2em] font-semibold hover:bg-black hover:text-white transition-colors">
      Buy It Now
    </button>
<button 
  onClick={handleBespokeCustomDesign}
  className="w-full bg-amber-50 border border-amber-300 text-amber-900 py-3 rounded text-xs uppercase tracking-[0.15em] font-semibold hover:bg-amber-100 transition-colors"
>
  Bespoke Custom Design
</button>
  </div>

            {/* Accordions */}
            <div className="border-t border-gray-200 divide-y divide-gray-200 text-xs">
              <div className="py-4">
                <button onClick={() => setDescOpen(!descOpen)} className="flex justify-between items-center w-full font-serif font-bold text-sm text-gray-900">
                  Product Description {descOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {descOpen && (
                  <p className="mt-3 text-gray-600 leading-relaxed">
                    {product.description || 'Hand-loomed piece featuring intricate temple borders and exquisite draping.'}
                  </p>
                )}
              </div>

              <div className="py-4">
                <button onClick={() => setMaterialOpen(!materialOpen)} className="flex justify-between items-center w-full font-serif font-bold text-sm text-gray-900">
                  Material & Care {materialOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {materialOpen && (
                  <p className="mt-3 text-gray-600 leading-relaxed">
                    {product.material_care || '100% Pure Mulberry Silk with Gold Zari Threads. Dry clean only.'}
                  </p>
                )}
              </div>

              <div className="py-4">
                <button onClick={() => setShippingOpen(!shippingOpen)} className="flex justify-between items-center w-full font-serif font-bold text-sm text-gray-900">
                  Shipping & Returns {shippingOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {shippingOpen && (
                  <p className="mt-3 text-gray-600 leading-relaxed">
                    Free worldwide express shipping with full DHL insurance coverage. 14-day return policy for unused items in original atelier packaging.
                  </p>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* RELATED MASTERPIECES */}
        <div className="mt-24">
          <h3 className="font-serif text-2xl font-light text-gray-900 mb-8">Related Masterpieces</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl">
            {relatedMasterpieces.map((rel) => (
              <div key={rel.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200/60 flex flex-col group">
                <div className="relative h-85 bg-gray-100 overflow-hidden">
                  <img src={rel.image} alt={rel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="p-4 flex flex-col flex-grow justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-medium mb-1">{rel.name}</h4>
                    <p className="text-xs font-bold text-gray-900">{rel.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="bg-[#F3EDE2] text-gray-800 pt-16 pb-12 px-6 lg:px-12 border-t border-gray-300">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-gray-300/60">
          <div className="md:col-span-2">
            <h3 className="font-serif text-xl tracking-[0.2em] font-bold mb-4">WEFTIN</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              A digital high-fashion atelier marrying heritage luxury craftsmanship with modern silhouettes. Stitched with unparalleled dedication to structural flow.
            </p>
            <p className="text-[11px] text-gray-600"><strong>Concierge:</strong> concierge@weftin.com</p>
            <p className="text-[11px] text-gray-600"><strong>Direct Line:</strong> 1-800-WEFT-LUXE</p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900 mb-4">Collections</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><a href="#" className="hover:text-black">Sarees</a></li>
              <li><a href="#" className="hover:text-black">Lehengas</a></li>
              <li><a href="#" className="hover:text-black">Dresses</a></li>
              <li><a href="#" className="hover:text-black">Kurtis</a></li>
              <li><a href="#" className="hover:text-black">Co-Ord Sets</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900 mb-4">Concierge Care</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><a href="#" className="hover:text-black">Help Center</a></li>
              <li><a href="#" className="hover:text-black">Order Tracking</a></li>
              <li><a href="#" className="hover:text-black">Returns & Adjustments</a></li>
              <li><a href="#" className="hover:text-black">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-black">Fabric Quality Guide</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900 mb-4">Account</h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li><Link to="/profile" className="hover:text-black">Sign In</Link></li>
              <li><Link to="/profile" className="hover:text-black">Register Membership</Link></li>
              <li><Link to="/dashboard" className="hover:text-black">Order History</Link></li>
              <li><Link to="/profile" className="hover:text-black">My Bespoke Fit</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-8 text-[11px] text-gray-500">
          <p>© 2026 WEFTIN Atelier. All Rights Reserved. Crafted with pristine elegance.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-black">Privacy Policy</a>
            <a href="#" className="hover:text-black">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

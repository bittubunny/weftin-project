import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Layers, XCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://weftin-project.onrender.com";

export default function Admin_HomeCMS_Page() {

  const [toastMessage, setToastMessage] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const showToast = (msg) => {
    setToastMessage(msg);

    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };


  // ============================================================
  // FETCH ALL PRODUCTS FROM SHOP
  // ============================================================

  const fetchProducts = async () => {
    const token = localStorage.getItem("weftin_token");

    try {

      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/admin/home-products`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await res.json();

      setProducts(
        Array.isArray(data) ? data : []
      );

    } catch (err) {

      console.error(
        "Error fetching Home CMS products:",
        err
      );

      showToast(
        "Failed to load Shop products."
      );

    } finally {

      setLoading(false);
    }
  };


  useEffect(() => {

    fetchProducts();

  }, []);


  // ============================================================
  // CHANGE HOME SECTION
  // ============================================================

  const handlePlacementChange = async (
    productId,
    newPlacement
  ) => {
    const token = localStorage.getItem("weftin_token");

    try {

      const res = await fetch(
        `${API_URL}/api/admin/home-products/${productId}/placement`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },

          body: JSON.stringify({
            section_placement: newPlacement
          })
        }
      );

      const data = await res.json();

      if (!res.ok) {

        throw new Error(
          data.detail ||
          "Failed to update placement."
        );
      }

      showToast(
        newPlacement === "Not on Home"
          ? "Product removed from Home page."
          : `Product assigned to ${newPlacement}.`
      );

      // Update only the changed product locally
      setProducts((currentProducts) =>
        currentProducts.map((product) =>
          product.id === productId
            ? {
                ...product,
                section_placement: newPlacement
              }
            : product
        )
      );

    } catch (err) {

      console.error(err);

      showToast(
        err.message ||
        "Backend connection error."
      );
    }
  };


  // ============================================================
  // REMOVE FROM HOME
  // ============================================================

  const handleRemoveFromHome = async (productId) => {

    await handlePlacementChange(
      productId,
      "Not on Home"
    );
  };


  return (

    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans p-8 lg:p-12">

      {/* =====================================================
          TOAST
      ====================================================== */}

      {toastMessage && (

        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl text-sm flex items-center gap-3 border border-amber-500/30">

          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>

          {toastMessage}

        </div>
      )}


      <div className="max-w-6xl mx-auto space-y-8">


        {/* =====================================================
            HEADER
        ====================================================== */}

        <div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-amber-800 font-semibold mb-2 hover:underline"
          >

            <ArrowLeft className="w-4 h-4" />

            Back to Shop / Admin Hub

          </Link>


          <h1 className="font-serif text-3xl font-light text-gray-900">

            Home Page Product CMS

          </h1>


          <p className="text-xs text-gray-500 mt-1">

            Select existing products from your Shop catalog
            and assign them to Home Page sections.

            Changes are saved instantly to NeonDB.

          </p>

        </div>


        {/* =====================================================
            PRODUCT LIST
        ====================================================== */}

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">


          <h3 className="font-serif text-lg font-bold mb-6 flex items-center gap-2 text-gray-950">

            <Layers className="w-5 h-5 text-amber-700" />

            Shop Catalog Products ({products.length})

          </h3>


          {loading ? (

            <div className="text-center py-16">

              <p className="text-xs text-gray-400 uppercase tracking-wider">

                Loading Shop products...

              </p>

            </div>

          ) : products.length === 0 ? (

            <div className="text-center py-16">

              <p className="text-xs text-gray-400 uppercase tracking-wider">

                No products found in the Shop database.

              </p>

            </div>

          ) : (

            <div className="space-y-4">


              {products.map((product) => (

                <div
                  key={product.id}
                  className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 gap-5"
                >


                  {/* =================================================
                      PRODUCT INFO
                  ================================================== */}

                  <div className="flex items-center gap-4 min-w-0">


                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-20 object-cover rounded shadow-sm flex-shrink-0"
                    />


                    <div className="min-w-0">

                      <h4 className="font-serif text-sm font-bold text-gray-900">

                        {product.name}

                      </h4>


                      <p className="text-xs text-gray-500 mt-1">

                        {product.price}

                        {" • "}

                        Category:

                        {" "}

                        <span className="font-semibold text-gray-700">

                          {product.category}

                        </span>

                      </p>


                      <p className="text-[10px] text-gray-400 mt-1">

                        Shop Product ID: {product.id}

                      </p>


                      <span
                        className={`inline-block mt-2 text-[9px] uppercase font-bold tracking-widest px-2 py-1 rounded ${
                          product.section_placement === "Not on Home"
                            ? "bg-gray-200 text-gray-600"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >

                        {product.section_placement === "Not on Home"
                          ? "Not on Home"
                          : `Home: ${product.section_placement}`}

                      </span>

                    </div>

                  </div>


                  {/* =================================================
                      CONTROLS
                  ================================================== */}

                  <div className="flex items-center gap-3 w-full lg:w-auto justify-end">


                    <select
                      value={
                        product.section_placement ||
                        "Not on Home"
                      }
                      onChange={(e) =>
                        handlePlacementChange(
                          product.id,
                          e.target.value
                        )
                      }
                      className="bg-white border border-amber-300 text-xs px-4 py-2.5 rounded font-bold text-amber-950 focus:outline-none focus:border-black shadow-sm cursor-pointer"
                    >

                      <option value="Not on Home">
                        Not on Home
                      </option>

                      <option value="Featured">
                        Featured Collection
                      </option>

                      <option value="Best Seller">
                        Best Seller
                      </option>

                      <option value="Trending">
                        Trending Now
                      </option>

                    </select>


                    {product.section_placement !== "Not on Home" && (

                      <button
                        onClick={() =>
                          handleRemoveFromHome(
                            product.id
                          )
                        }
                        className="p-2.5 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                        title="Remove from Home page"
                      >

                        <XCircle className="w-4 h-4" />

                      </button>

                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

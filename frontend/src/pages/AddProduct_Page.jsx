import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, X } from "lucide-react";

export default function AddProduct_Page() {
  const initialForm = {
    name: "",
    category: "Sarees",
    sku: "WFT-SR-1042",

    price: "",
    old_price: "",

    tag: "ATELIER EXCLUSIVE",

    image: "",
    image2: "",
    image3: "",
    image4: "",

    description: "",
    material_care: "",

    // NEW FILTER DATA
    sizes: [],
    color: "",

    // AVAILABILITY
    in_stock: true,
    custom_stitching: true,
  };

  const [form, setForm] = useState(initialForm);
  const [toastMessage, setToastMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  // ---------------------------------------------------------
  // HANDLE NORMAL INPUTS
  // ---------------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ---------------------------------------------------------
  // SIZE SELECTION
  // ---------------------------------------------------------

  const availableSizes = [
    "XS",
    "S",
    "M",
    "L",
    "XL",
    "XXL",
    "Free Size",
  ];

  const toggleSize = (size) => {
    setForm((prev) => {
      const alreadySelected = prev.sizes.includes(size);

      return {
        ...prev,
        sizes: alreadySelected
          ? prev.sizes.filter((s) => s !== size)
          : [...prev.sizes, size],
      };
    });
  };

  // ---------------------------------------------------------
  // SUBMIT PRODUCT
  // ---------------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.name.trim()) {
      showToast("Please enter a product name.");
      return;
    }

    if (!form.price.trim()) {
      showToast("Please enter the product price.");
      return;
    }

    if (!form.image.trim()) {
      showToast("Please enter the main image URL.");
      return;
    }

    if (form.sizes.length === 0) {
      showToast("Please select at least one size.");
      return;
    }

    if (!form.color) {
      showToast("Please select a product color.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/products",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name,
            category: form.category,
            sku: form.sku,

            price: form.price,
            old_price: form.old_price || null,

            tag: form.tag,

            image: form.image,
            image2: form.image2 || null,
            image3: form.image3 || null,
            image4: form.image4 || null,

            description: form.description || null,
            material_care: form.material_care || null,

            // NEW FILTER FIELDS
            sizes: form.sizes,
            color: form.color,

            // AVAILABILITY
            in_stock: form.in_stock,
            custom_stitching: form.custom_stitching,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        showToast("Product successfully saved to NeonDB!");

        setForm(initialForm);
      } else {
        console.error("Product save error:", data);

        showToast(
          data.detail ||
            "Failed to save product."
        );
      }
    } catch (err) {
      console.error("Backend connection error:", err);

      showToast(
        "Backend connection error. Make sure FastAPI is running."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-gray-900 font-sans p-8 lg:p-16">

      {/* =====================================================
          TOAST
      ====================================================== */}

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-2xl text-sm border border-amber-500/30">
          {toastMessage}
        </div>
      )}

      {/* =====================================================
          MAIN CARD
      ====================================================== */}

      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">

        {/* HEADER */}

        <div className="flex justify-between items-center mb-8 pb-5 border-b border-gray-100">

          <div>
            <span className="text-[10px] uppercase tracking-widest text-amber-700 font-semibold block mb-1">
              NEONDB INVENTORY ADMIN
            </span>

            <h2 className="font-serif text-2xl text-gray-900">
              Add New Product
            </h2>

            <p className="text-xs text-gray-500 mt-1">
              Add catalog, filter and availability information.
            </p>
          </div>

          <Link
            to="/shop"
            className="text-xs uppercase tracking-wider text-gray-600 flex items-center gap-1 hover:text-black"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-7 text-xs"
        >

          {/* =================================================
              BASIC PRODUCT INFORMATION
          ================================================== */}

          <div>

            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900 mb-4">
              Product Information
            </h3>

            <div className="space-y-5">

              {/* PRODUCT NAME */}

              <div>
                <label className="block uppercase tracking-wider text-gray-500 mb-2 font-semibold">
                  Product Name
                </label>

                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Royal Gold Silk Saree"
                  className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded focus:outline-none focus:border-black"
                />
              </div>

              {/* CATEGORY + SKU */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>

                  <label className="block uppercase tracking-wider text-gray-500 mb-2 font-semibold">
                    Category
                  </label>

                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded focus:outline-none focus:border-black"
                  >
                    {[
                      "Sarees",
                      "Lehengas",
                      "Dresses & Gowns",
                      "Kurtis",
                      "Co-Ord Sets",
                      "Kids Wear",
                    ].map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))}
                  </select>

                </div>

                <div>

                  <label className="block uppercase tracking-wider text-gray-500 mb-2 font-semibold">
                    SKU Code
                  </label>

                  <input
                    type="text"
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    placeholder="WFT-SR-1042"
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded uppercase focus:outline-none focus:border-black"
                  />

                </div>

              </div>

              {/* PRICE */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>

                  <label className="block uppercase tracking-wider text-gray-500 mb-2 font-semibold">
                    Price
                  </label>

                  <input
                    type="text"
                    name="price"
                    required
                    value={form.price}
                    onChange={handleChange}
                    placeholder="₹8,999"
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded focus:outline-none focus:border-black"
                  />

                </div>

                <div>

                  <label className="block uppercase tracking-wider text-gray-500 mb-2 font-semibold">
                    Old Price
                  </label>

                  <input
                    type="text"
                    name="old_price"
                    value={form.old_price}
                    onChange={handleChange}
                    placeholder="₹12,500"
                    className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded focus:outline-none focus:border-black"
                  />

                </div>

              </div>

              {/* TAG */}

              <div>

                <label className="block uppercase tracking-wider text-gray-500 mb-2 font-semibold">
                  Product Tag
                </label>

                <select
                  name="tag"
                  value={form.tag}
                  onChange={handleChange}
                  className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded focus:outline-none focus:border-black"
                >
                  <option value="ATELIER EXCLUSIVE">
                    ATELIER EXCLUSIVE
                  </option>

                  <option value="NEW ARRIVAL">
                    NEW ARRIVAL
                  </option>

                  <option value="BEST SELLER">
                    BEST SELLER
                  </option>

                  <option value="TRENDING">
                    TRENDING
                  </option>

                  <option value="LIMITED EDITION">
                    LIMITED EDITION
                  </option>
                </select>

              </div>

            </div>

          </div>

          {/* =================================================
              FILTER INFORMATION
          ================================================== */}

          <div className="border-t border-gray-100 pt-7">

            <div className="mb-4">

              <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900">
                Shop Filter Information
              </h3>

              <p className="text-[11px] text-gray-500 mt-1">
                These values are stored in NeonDB and used by
                the Shop filter panel.
              </p>

            </div>

            {/* =================================================
                SIZES
            ================================================== */}

            <div className="mb-6">

              <label className="block uppercase tracking-wider text-gray-500 mb-3 font-semibold">
                Available Sizes
              </label>

              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">

                {availableSizes.map((size) => {

                  const selected =
                    form.sizes.includes(size);

                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`
                        py-2.5 px-2 rounded border text-[10px]
                        uppercase tracking-wider font-semibold
                        transition-all
                        ${
                          selected
                            ? "bg-black text-white border-black"
                            : "bg-white text-gray-700 border-gray-200 hover:border-black"
                        }
                      `}
                    >

                      {selected && (
                        <Check className="w-3 h-3 inline mr-1" />
                      )}

                      {size}

                    </button>
                  );
                })}

              </div>

              <p className="text-[10px] text-gray-400 mt-2">
                Selected:{" "}
                {form.sizes.length > 0
                  ? form.sizes.join(", ")
                  : "None"}
              </p>

            </div>

            {/* =================================================
                COLOR
            ================================================== */}

            <div className="mb-6">

              <label className="block uppercase tracking-wider text-gray-500 mb-3 font-semibold">
                Product Color
              </label>

              <select
                name="color"
                value={form.color}
                onChange={handleChange}
                required
                className="w-full bg-gray-50 border border-gray-200 px-4 py-3 rounded focus:outline-none focus:border-black"
              >

                <option value="">
                  Select Product Color
                </option>

                <option value="Rose">
                  Rose
                </option>

                <option value="Emerald">
                  Emerald
                </option>

                <option value="Indigo">
                  Indigo
                </option>

                <option value="Amber">
                  Amber
                </option>

                <option value="Pink">
                  Pink
                </option>

                <option value="Gold">
                  Gold
                </option>

                <option value="Silver">
                  Silver
                </option>

                <option value="Black">
                  Black
                </option>

                <option value="White">
                  White
                </option>

                <option value="Red">
                  Red
                </option>

                <option value="Blue">
                  Blue
                </option>

                <option value="Green">
                  Green
                </option>

                <option value="Purple">
                  Purple
                </option>

                <option value="Maroon">
                  Maroon
                </option>

                <option value="Beige">
                  Beige
                </option>

                <option value="Multicolor">
                  Multicolor
                </option>

              </select>

            </div>

            {/* =================================================
                AVAILABILITY
            ================================================== */}

            <div>

              <label className="block uppercase tracking-wider text-gray-500 mb-3 font-semibold">
                Availability & Services
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                {/* IN STOCK */}

                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      in_stock: !prev.in_stock,
                    }))
                  }
                  className={`
                    flex items-center justify-between
                    border rounded-lg px-4 py-3
                    transition-all
                    ${
                      form.in_stock
                        ? "border-green-300 bg-green-50"
                        : "border-gray-200 bg-gray-50"
                    }
                  `}
                >

                  <div className="text-left">

                    <span className="block font-semibold text-gray-800">
                      In Stock
                    </span>

                    <span className="text-[10px] text-gray-500">
                      Product is currently available
                    </span>

                  </div>

                  <div
                    className={`
                      w-5 h-5 rounded-full flex items-center justify-center
                      ${
                        form.in_stock
                          ? "bg-green-600 text-white"
                          : "bg-gray-300 text-white"
                      }
                    `}
                  >
                    {form.in_stock && (
                      <Check className="w-3 h-3" />
                    )}
                  </div>

                </button>

                {/* CUSTOM STITCHING */}

                <button
                  type="button"
                  onClick={() =>
                    setForm((prev) => ({
                      ...prev,
                      custom_stitching:
                        !prev.custom_stitching,
                    }))
                  }
                  className={`
                    flex items-center justify-between
                    border rounded-lg px-4 py-3
                    transition-all
                    ${
                      form.custom_stitching
                        ? "border-amber-300 bg-amber-50"
                        : "border-gray-200 bg-gray-50"
                    }
                  `}
                >

                  <div className="text-left">

                    <span className="block font-semibold text-gray-800">
                      Custom Stitching
                    </span>

                    <span className="text-[10px] text-gray-500">
                      Tailoring service available
                    </span>

                  </div>

                  <div
                    className={`
                      w-5 h-5 rounded-full flex items-center justify-center
                      ${
                        form.custom_stitching
                          ? "bg-amber-700 text-white"
                          : "bg-gray-300 text-white"
                      }
                    `}
                  >
                    {form.custom_stitching && (
                      <Check className="w-3 h-3" />
                    )}
                  </div>

                </button>

              </div>

            </div>

          </div>

          {/* =================================================
              IMAGES
          ================================================== */}

          <div className="border-t border-gray-100 pt-7">

            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-gray-900 mb-4">
              Product Images
            </h3>

            <div className="space-y-3">

              <input
                type="text"
                name="image"
                required
                value={form.image}
                onChange={handleChange}
                placeholder="Main Image URL..."
                className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded focus:outline-none focus:border-black"
              />

              <input
                type="text"
                name="image2"
                value={form.image2}
                onChange={handleChange}
                placeholder="Thumbnail 2 URL..."
                className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded focus:outline-none focus:border-black"
              />

              <input
                type="text"
                name="image3"
                value={form.image3}
                onChange={handleChange}
                placeholder="Thumbnail 3 URL..."
                className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded focus:outline-none focus:border-black"
              />

              <input
                type="text"
                name="image4"
                value={form.image4}
                onChange={handleChange}
                placeholder="Thumbnail 4 URL..."
                className="w-full bg-gray-50 border border-gray-200 px-4 py-2.5 rounded focus:outline-none focus:border-black"
              />

            </div>

          </div>

          {/* =================================================
              DESCRIPTION
          ================================================== */}

          <div>

            <label className="block uppercase tracking-wider text-gray-500 mb-2 font-semibold">
              Product Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Detailed description..."
              rows="4"
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded focus:outline-none focus:border-black"
            />

          </div>

          {/* =================================================
              MATERIAL & CARE
          ================================================== */}

          <div>

            <label className="block uppercase tracking-wider text-gray-500 mb-2 font-semibold">
              Material & Care Instructions
            </label>

            <textarea
              name="material_care"
              value={form.material_care}
              onChange={handleChange}
              placeholder="100% Pure Silk..."
              rows="3"
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded focus:outline-none focus:border-black"
            />

          </div>

          {/* =================================================
              PRODUCT SUMMARY
          ================================================== */}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">

            <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-900 mb-4">
              Product Filter Summary
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              <div>
                <span className="text-[9px] uppercase text-gray-400 block">
                  Category
                </span>
                <span className="font-semibold text-gray-800">
                  {form.category}
                </span>
              </div>

              <div>
                <span className="text-[9px] uppercase text-gray-400 block">
                  Color
                </span>
                <span className="font-semibold text-gray-800">
                  {form.color || "Not selected"}
                </span>
              </div>

              <div>
                <span className="text-[9px] uppercase text-gray-400 block">
                  Sizes
                </span>
                <span className="font-semibold text-gray-800">
                  {form.sizes.length
                    ? form.sizes.join(", ")
                    : "None"}
                </span>
              </div>

              <div>
                <span className="text-[9px] uppercase text-gray-400 block">
                  Stock
                </span>
                <span className="font-semibold text-gray-800">
                  {form.in_stock
                    ? "Available"
                    : "Out of Stock"}
                </span>
              </div>

            </div>

          </div>

          {/* =================================================
              SAVE BUTTON
          ================================================== */}

          <button
            type="submit"
            disabled={saving}
            className={`
              w-full text-white py-4 rounded
              text-xs uppercase tracking-[0.2em]
              font-semibold transition-colors
              ${
                saving
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
              }
            `}
          >
            {saving
              ? "Saving Product..."
              : "Save Product to NeonDB"}
          </button>

        </form>

      </div>

    </div>
  );
}
import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://127.0.0.1:8000";

const sectionNames = {
  hero: "Hero Section",
  quote: "Quote Section",
  featured: "Featured Premier Drop",
  secondary_vaults: "Secondary Private Vaults",
  guarantees: "Atelier Showroom Guarantees"
};

export default function Admin_Limitededition_Page() {

  const [sections, setSections] = useState([]);

  const [settings, setSettings] =
    useState({
      days: 0,
      hours: 0,
      minutes: 0,
      is_active: true
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [toast, setToast] =
    useState("");

  const showToast = (message) => {

    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 3000);

  };

  // =========================================================
  // LOAD
  // =========================================================

  const loadData = async () => {

    try {

      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/api/limited-edition`
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Failed to load"
        );
      }

      setSections(
        data.sections || []
      );

      setSettings(
        data.settings || {
          days: 0,
          hours: 0,
          minutes: 0,
          is_active: true
        }
      );

    } catch (error) {

      console.error(error);

      showToast(
        "Failed to load Limited Edition"
      );

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {
    loadData();
  }, []);

  // =========================================================
  // CHANGE SECTION
  // =========================================================

  const changeSection = (
    sectionKey,
    field,
    value
  ) => {

    setSections(
      previous =>
        previous.map(
          section =>
            section.section_key ===
            sectionKey
              ? {
                  ...section,
                  [field]: value
                }
              : section
        )
    );

  };

  // =========================================================
  // CHANGE ITEM
  // =========================================================

  const changeItem = (
    sectionKey,
    itemId,
    field,
    value
  ) => {

    setSections(
      previous =>
        previous.map(
          section => {

            if (
              section.section_key !==
              sectionKey
            ) {
              return section;
            }

            return {
              ...section,

              items:
                section.items.map(
                  item =>
                    item.id === itemId
                      ? {
                          ...item,
                          [field]: value
                        }
                      : item
                )
            };

          }
        )
    );

  };

  // =========================================================
  // SAVE SECTION
  // =========================================================

  const saveSection = async (
    section
  ) => {

    try {

      setSaving(true);

      const response = await fetch(
        `${API_BASE_URL}/api/limited-edition/section/${section.section_key}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify(
            section
          )
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Failed to save"
        );
      }

      showToast(
        "Section saved successfully"
      );

    } catch (error) {

      console.error(error);

      showToast(error.message);

    } finally {

      setSaving(false);

    }

  };

  // =========================================================
  // SAVE ITEM
  // =========================================================

  const saveItem = async (
    item
  ) => {

    try {

      setSaving(true);

      const response = await fetch(
        `${API_BASE_URL}/api/limited-edition/item/${item.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify(
            item
          )
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Failed to save item"
        );
      }

      showToast(
        "Item saved successfully"
      );

    } catch (error) {

      console.error(error);

      showToast(error.message);

    } finally {

      setSaving(false);

    }

  };

  // =========================================================
  // ADD ITEM
  // =========================================================

  const addItem = async (
    sectionKey
  ) => {

    try {

      setSaving(true);

      const response = await fetch(
        `${API_BASE_URL}/api/limited-edition/item`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            section_key:
              sectionKey,

            title:
              "New Limited Edition Item",

            description:
              "",

            price:
              "",

            image_url:
              "",

            button_text:
              "Request Access",

            button_link:
              "#",

            product_id:
              null,

            icon_name:
              "ShieldCheck",

            is_active:
              true,

            display_order:
              99
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Failed to add item"
        );
      }

      showToast(
        "New item added"
      );

      await loadData();

    } catch (error) {

      console.error(error);

      showToast(error.message);

    } finally {

      setSaving(false);

    }

  };

  // =========================================================
  // DELETE ITEM
  // =========================================================

  const deleteItem = async (
    id
  ) => {

    if (
      !window.confirm(
        "Delete this Limited Edition item?"
      )
    ) {
      return;
    }

    try {

      setSaving(true);

      const response = await fetch(
        `${API_BASE_URL}/api/limited-edition/item/${id}`,
        {
          method: "DELETE"
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Failed to delete"
        );
      }

      showToast(
        "Item deleted"
      );

      await loadData();

    } catch (error) {

      console.error(error);

      showToast(error.message);

    } finally {

      setSaving(false);

    }

  };

  // =========================================================
  // SAVE COUNTDOWN
  // =========================================================

  const saveSettings = async () => {

    try {

      setSaving(true);

      const response = await fetch(
        `${API_BASE_URL}/api/limited-edition/settings`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify(
            settings
          )
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
          "Failed to save countdown"
        );
      }

      showToast(
        "Countdown saved successfully"
      );

    } catch (error) {

      console.error(error);

      showToast(error.message);

    } finally {

      setSaving(false);

    }

  };

  if (loading) {

    return (
      <div className="p-10 text-center">
        Loading Limited Edition...
      </div>
    );

  }

  return (

    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-10">

      {/* TOAST */}

      {toast && (

        <div className="fixed top-5 right-5 z-50 bg-black text-white px-5 py-3 rounded-lg shadow-xl text-sm">
          {toast}
        </div>

      )}

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="mb-8">

          <h1 className="text-2xl sm:text-3xl font-serif font-semibold">
            Limited Edition Management
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage the complete Limited Edition Vault page.
          </p>

        </div>

        {/* COUNTDOWN */}

        <div className="bg-[#1C1816] text-white rounded-2xl p-6 sm:p-8 mb-8">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

            <div>

              <h2 className="font-serif text-xl">
                Vault Countdown
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                Control the countdown displayed on the customer page.
              </p>

            </div>

            <button
              disabled={saving}
              onClick={saveSettings}
              className="bg-amber-600 hover:bg-amber-500 px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest"
            >
              Save Countdown
            </button>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">

            <DarkField
              label="Days"
              type="number"
              value={settings.days}
              onChange={(value) =>
                setSettings({
                  ...settings,
                  days: Number(value)
                })
              }
            />

            <DarkField
              label="Hours"
              type="number"
              value={settings.hours}
              onChange={(value) =>
                setSettings({
                  ...settings,
                  hours: Number(value)
                })
              }
            />

            <DarkField
              label="Minutes"
              type="number"
              value={settings.minutes}
              onChange={(value) =>
                setSettings({
                  ...settings,
                  minutes: Number(value)
                })
              }
            />

          </div>

        </div>

        {/* SECTIONS */}

        <div className="space-y-8">

          {sections.map(
            section => (

              <div
                key={section.section_key}
                className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
              >

                {/* SECTION HEADER */}

                <div className="bg-[#F3EDE2] px-5 sm:px-7 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                  <div>

                    <h2 className="font-serif text-xl">
                      {
                        sectionNames[
                          section.section_key
                        ] ||
                        section.section_key
                      }
                    </h2>

                    <p className="text-xs text-gray-500 mt-1">
                      {section.section_key}
                    </p>

                  </div>

                  <button
                    disabled={saving}
                    onClick={() =>
                      saveSection(
                        section
                      )
                    }
                    className="bg-black text-white px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest"
                  >
                    Save Section
                  </button>

                </div>

                {/* SECTION FIELDS */}

                <div className="p-5 sm:p-7 grid grid-cols-1 lg:grid-cols-2 gap-5">

                  <Field
                    label="Eyebrow"
                    value={
                      section.eyebrow ||
                      ""
                    }
                    onChange={value =>
                      changeSection(
                        section.section_key,
                        "eyebrow",
                        value
                      )
                    }
                  />

                  <Field
                    label="Title"
                    value={
                      section.title ||
                      ""
                    }
                    onChange={value =>
                      changeSection(
                        section.section_key,
                        "title",
                        value
                      )
                    }
                  />

                  <Field
                    label="Image URL"
                    value={
                      section.image_url ||
                      ""
                    }
                    onChange={value =>
                      changeSection(
                        section.section_key,
                        "image_url",
                        value
                      )
                    }
                  />

                  <Field
                    label="Button Text"
                    value={
                      section.button_text ||
                      ""
                    }
                    onChange={value =>
                      changeSection(
                        section.section_key,
                        "button_text",
                        value
                      )
                    }
                  />

                  <Field
                    label="Button Link"
                    value={
                      section.button_link ||
                      ""
                    }
                    onChange={value =>
                      changeSection(
                        section.section_key,
                        "button_link",
                        value
                      )
                    }
                  />

                  <Field
                    label="Display Order"
                    type="number"
                    value={
                      section.display_order ||
                      0
                    }
                    onChange={value =>
                      changeSection(
                        section.section_key,
                        "display_order",
                        Number(value)
                      )
                    }
                  />

                  <div className="lg:col-span-2">

                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                      Description
                    </label>

                    <textarea
                      rows={4}
                      value={
                        section.description ||
                        ""
                      }
                      onChange={e =>
                        changeSection(
                          section.section_key,
                          "description",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm outline-none focus:border-black"
                    />

                  </div>

                  <label className="flex items-center gap-3 text-sm">

                    <input
                      type="checkbox"
                      checked={
                        section.is_active
                      }
                      onChange={e =>
                        changeSection(
                          section.section_key,
                          "is_active",
                          e.target.checked
                        )
                      }
                    />

                    Section Active

                  </label>

                </div>

                {/* ITEMS */}

                {section.section_key !==
                  "hero" &&
                  section.section_key !==
                    "quote" && (

                  <div className="border-t border-gray-200 p-5 sm:p-7">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

                      <div>

                        <h3 className="font-semibold text-lg">
                          Content Items
                        </h3>

                        <p className="text-xs text-gray-500">
                          Manage everything displayed inside this section.
                        </p>

                      </div>

                      <button
                        onClick={() =>
                          addItem(
                            section.section_key
                          )
                        }
                        className="px-4 py-2 bg-amber-700 text-white rounded-lg text-xs uppercase tracking-wider"
                      >
                        + Add Item
                      </button>

                    </div>

                    <div className="space-y-6">

                      {(section.items || []).map(
                        (item, index) => (

                          <div
                            key={item.id}
                            className="border border-gray-200 rounded-xl p-5 bg-gray-50"
                          >

                            <div className="flex justify-between items-center mb-5">

                              <h4 className="font-semibold">
                                Item #{index + 1}
                              </h4>

                              <button
                                onClick={() =>
                                  deleteItem(
                                    item.id
                                  )
                                }
                                className="text-red-600 text-xs"
                              >
                                Delete
                              </button>

                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                              <Field
                                label="Title / Name"
                                value={
                                  item.title ||
                                  ""
                                }
                                onChange={value =>
                                  changeItem(
                                    section.section_key,
                                    item.id,
                                    "title",
                                    value
                                  )
                                }
                              />

                              <Field
                                label="Price"
                                value={
                                  item.price ||
                                  ""
                                }
                                onChange={value =>
                                  changeItem(
                                    section.section_key,
                                    item.id,
                                    "price",
                                    value
                                  )
                                }
                              />

                              <Field
                                label="Image URL"
                                value={
                                  item.image_url ||
                                  ""
                                }
                                onChange={value =>
                                  changeItem(
                                    section.section_key,
                                    item.id,
                                    "image_url",
                                    value
                                  )
                                }
                              />

                              <Field
                                label="Button Text"
                                value={
                                  item.button_text ||
                                  ""
                                }
                                onChange={value =>
                                  changeItem(
                                    section.section_key,
                                    item.id,
                                    "button_text",
                                    value
                                  )
                                }
                              />

                              <Field
                                label="Button Link"
                                value={
                                  item.button_link ||
                                  ""
                                }
                                onChange={value =>
                                  changeItem(
                                    section.section_key,
                                    item.id,
                                    "button_link",
                                    value
                                  )
                                }
                              />

                              <Field
                                label="Product ID"
                                type="number"
                                value={
                                  item.product_id ||
                                  ""
                                }
                                onChange={value =>
                                  changeItem(
                                    section.section_key,
                                    item.id,
                                    "product_id",
                                    value
                                      ? Number(value)
                                      : null
                                  )
                                }
                              />

                              <Field
                                label="Display Order"
                                type="number"
                                value={
                                  item.display_order ||
                                  0
                                }
                                onChange={value =>
                                  changeItem(
                                    section.section_key,
                                    item.id,
                                    "display_order",
                                    Number(value)
                                  )
                                }
                              />

                              {section.section_key ===
                                "guarantees" && (

                                <Field
                                  label="Icon Name"
                                  value={
                                    item.icon_name ||
                                    "ShieldCheck"
                                  }
                                  onChange={value =>
                                    changeItem(
                                      section.section_key,
                                      item.id,
                                      "icon_name",
                                      value
                                    )
                                  }
                                />

                              )}

                              <div className="lg:col-span-2">

                                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
                                  Description
                                </label>

                                <textarea
                                  rows={3}
                                  value={
                                    item.description ||
                                    ""
                                  }
                                  onChange={e =>
                                    changeItem(
                                      section.section_key,
                                      item.id,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white outline-none focus:border-black"
                                />

                              </div>

                              <label className="flex items-center gap-3 text-sm">

                                <input
                                  type="checkbox"
                                  checked={
                                    item.is_active
                                  }
                                  onChange={e =>
                                    changeItem(
                                      section.section_key,
                                      item.id,
                                      "is_active",
                                      e.target.checked
                                    )
                                  }
                                />

                                Item Active

                              </label>

                            </div>

                            {/* IMAGE PREVIEW */}

                            {item.image_url && (

                              <div className="mt-5">

                                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                                  Image Preview
                                </p>

                                <img
                                  src={
                                    item.image_url
                                  }
                                  alt=""
                                  className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                                />

                              </div>

                            )}

                            <div className="mt-5 flex justify-end">

                              <button
                                disabled={saving}
                                onClick={() =>
                                  saveItem(
                                    item
                                  )
                                }
                                className="bg-black text-white px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider"
                              >
                                Save Item
                              </button>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  </div>

                )}

              </div>

            )
          )}

        </div>

      </div>

    </div>

  );
}


// =========================================================
// FIELD
// =========================================================

function Field({
  label,
  value,
  onChange,
  type = "text"
}) {

  return (

    <div>

      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-2">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={e =>
          onChange(
            e.target.value
          )
        }
        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white outline-none focus:border-black"
      />

    </div>

  );

}


// =========================================================
// DARK FIELD
// =========================================================

function DarkField({
  label,
  value,
  onChange,
  type = "text"
}) {

  return (

    <div>

      <label className="block text-xs uppercase tracking-wider text-gray-400 mb-2">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={e =>
          onChange(
            e.target.value
          )
        }
        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-amber-500"
      />

    </div>

  );

}
/**
 * Create Auction Page
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useApi";
import { apiClient } from "@/services/api";
import { toast } from "@/store/toastStore";
import { X, Upload } from "lucide-react";
import { useLanguageStore } from "@/store/languageStore";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface CreateAuctionForm {
  title: string;
  description: string;
  category_id: number;
  starting_price: number;
  reserve_price: number;
  buy_now_price: number;
  minimum_increment: number;
  start_time: string;
  end_time: string;
  anti_snipe_seconds: number;
}

interface UploadedImage {
  file: File;
  preview: string;
  isPrimary: boolean;
  altText: string;
}

const extractResponseList = (response: any) =>
  Array.isArray(response?.data) ? response.data : response?.data?.results || [];

const toLocalInputValue = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

const getDefaultAntiSnipeSeconds = () => {
  try {
    const raw = localStorage.getItem("admin_app_settings");
    if (!raw) return 60;
    const parsed = JSON.parse(raw) as { defaultAntiSnipeSeconds?: number };
    const seconds = Number(parsed?.defaultAntiSnipeSeconds);
    return Number.isFinite(seconds) && seconds > 0 ? seconds : 60;
  } catch {
    return 60;
  }
};

const CreateAuctionPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { t } = useLanguageStore();
  const defaultAntiSnipeSeconds = getDefaultAntiSnipeSeconds();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  const [form, setForm] = useState<CreateAuctionForm>({
    title: "",
    description: "",
    category_id: 0,
    starting_price: 0,
    reserve_price: 0,
    buy_now_price: 0,
    minimum_increment: 1,
    start_time: (() => {
      const now = new Date();
      return toLocalInputValue(now);
    })(),
    end_time: (() => {
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      return toLocalInputValue(endDate);
    })(),
    anti_snipe_seconds: defaultAntiSnipeSeconds,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    fetchCategories();
  }, [isAuthenticated, navigate]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get("/auctions/categories/");
      const data = extractResponseList(response);
      setCategories(data);
      if (data.length > 0) {
        setForm((prev) => ({ ...prev, category_id: data[0].id }));
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error(t("createLoadCategoriesFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        name.includes("price") ||
        name.includes("increment") ||
        name === "anti_snipe_seconds"
          ? parseFloat(value)
          : value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (images.length + files.length > 10) {
      toast.error(t("createMaxImages"));
      return;
    }

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} ${t("createInvalidImage")}`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} ${t("createImageTooLarge")}`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const newImage: UploadedImage = {
          file,
          preview: event.target?.result as string,
          isPrimary: images.length === 0,
          altText: "",
        };
        setImages((prev) => [...prev, newImage]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const newImages = prev.filter((_, i) => i !== index);
      // If we removed the primary, make the first one primary
      if (prev[index].isPrimary && newImages.length > 0) {
        newImages[0].isPrimary = true;
      }
      return newImages;
    });
  };

  const setPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    );
  };

  const updateImageAltText = (index: number, altText: string) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, altText } : img)),
    );
  };

  const validateForm = (): boolean => {
    if (!form.title.trim()) {
      toast.error(t("createTitleRequired"));
      return false;
    }

    if (!form.description.trim()) {
      toast.error(t("createDescriptionRequired"));
      return false;
    }

    if (!form.category_id) {
      toast.error(t("createCategoryRequired"));
      return false;
    }

    if (form.starting_price <= 0) {
      toast.error(t("createStartingPriceMin"));
      return false;
    }

    if (form.reserve_price < 0) {
      toast.error(t("createReserveNonNegative"));
      return false;
    }

    if (form.buy_now_price && form.buy_now_price < form.starting_price) {
      toast.error(t("createBuyNowMin"));
      return false;
    }

    if (form.minimum_increment <= 0) {
      toast.error(t("createMinIncrementMin"));
      return false;
    }

    const startTime = new Date(form.start_time);
    const endTime = new Date(form.end_time);

    if (endTime <= startTime) {
      toast.error(t("createEndAfterStart"));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        category_id: form.category_id,
        starting_price: form.starting_price.toString(),
        reserve_price: form.reserve_price || null,
        buy_now_price: form.buy_now_price || null,
        minimum_increment: form.minimum_increment.toString(),
        start_time: new Date(form.start_time).toISOString(),
        end_time: new Date(form.end_time).toISOString(),
        anti_snipe_seconds: form.anti_snipe_seconds,
        status: "active",
      };

      console.log("[CREATE AUCTION] Submitting payload:", payload);

      const response = await apiClient.post("/auctions/auctions/", payload);

      console.log("[CREATE AUCTION] Response:", response.data);

      const auctionId = response.data.id;

      // Upload images if provided
      if (images.length > 0) {
        console.log("[CREATE AUCTION] Uploading", images.length, "images");

        for (let i = 0; i < images.length; i++) {
          try {
            const formData = new FormData();
            formData.append("auction", auctionId.toString());
            formData.append("image", images[i].file);
            formData.append("alt_text", images[i].altText || `Image ${i + 1}`);
            formData.append("is_primary", images[i].isPrimary.toString());
            formData.append("display_order", i.toString());

            await apiClient.post("/media/auction-images/", formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            });

            console.log(
              "[CREATE AUCTION] Image",
              i + 1,
              "uploaded successfully",
            );
          } catch (imgError) {
            console.error(
              "[CREATE AUCTION] Error uploading image",
              i + 1,
              ":",
              imgError,
            );
            toast.error(`${t("createImageUploadFailed")} ${i + 1}`);
          }
        }
      }

      toast.success(t("createAuctionSuccess"));
      navigate(`/auctions/${auctionId}`);
    } catch (error: any) {
      console.error("[CREATE AUCTION] Error:", error);

      const errorMessage = error.response?.data?.detail
        ? typeof error.response.data.detail === "string"
          ? error.response.data.detail
          : JSON.stringify(error.response.data.detail)
        : error.response?.data
          ? JSON.stringify(error.response.data)
          : error.message || t("createAuctionFailed");

      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-red-50 py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            {t("createAuctionTitle")}
          </h1>
          <p className="text-slate-600 mt-2">{t("createAuctionSubtitle")}</p>
        </div>

        {/* Form */}
        <div className="bg-white/90 rounded-2xl shadow-sm border border-red-100/80 backdrop-blur">
          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {t("title")} *
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleInputChange}
                placeholder={t("title")}
                className="w-full px-4 py-2.5 border border-red-100 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {t("description")} *
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                placeholder={t("description")}
                rows={5}
                className="w-full px-4 py-2.5 border border-red-100 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition"
                required
              ></textarea>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                {t("category")} *
              </label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border border-red-100 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition"
                required
              >
                <option value={0}>{t("selectCategory")}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Images Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                {t("images")} ({t("imagesHint")})
              </h3>

              {/* Image Upload Area */}
              <div className="mb-6">
                <label className="block">
                  <div className="border-2 border-dashed border-red-200/80 rounded-2xl p-8 text-center hover:border-red-400 hover:bg-red-50/50 transition cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-red-300" />
                    <p className="text-sm text-red-700/80">
                      {t("uploadDropText")}
                    </p>
                    <p className="text-xs text-red-600/70 mt-1">
                      {t("uploadHint")}
                    </p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Uploaded Images Preview */}
              {images.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className="border border-red-100 rounded-xl overflow-hidden bg-white shadow-sm"
                    >
                      {/* Image Preview */}
                      <div className="relative bg-gray-100 aspect-square">
                        <img
                          src={img.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition shadow-sm"
                        >
                          <X size={16} />
                        </button>
                        {img.isPrimary && (
                          <div className="absolute bottom-2 left-2 bg-red-600/90 text-white px-2 py-1 rounded text-xs font-semibold">
                            {t("setPrimary")}
                          </div>
                        )}
                      </div>

                      {/* Image Controls */}
                      <div className="p-3 space-y-2">
                        {/* Alt Text */}
                        <input
                          type="text"
                          value={img.altText}
                          onChange={(e) =>
                            updateImageAltText(index, e.target.value)
                          }
                          placeholder={t("altTextOptional")}
                          className="w-full px-3 py-2 border border-red-100 rounded-lg text-sm focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none"
                        />

                        {/* Set Primary Button */}
                        {!img.isPrimary && (
                          <button
                            type="button"
                            onClick={() => setPrimaryImage(index)}
                            className="w-full px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm rounded-lg transition"
                          >
                            {t("setPrimary")}
                          </button>
                        )}

                        {/* Image Number */}
                        <p className="text-xs text-slate-500 text-center">
                          {t("images")} {index + 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {images.length === 0 && (
                <p className="text-center text-slate-500 py-8">
                  {t("noImages")}
                </p>
              )}
            </div>

            {/* Pricing Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                {t("pricing")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Starting Price */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {t("startingPrice")} (€) *
                  </label>
                  <input
                    type="number"
                    name="starting_price"
                    value={form.starting_price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2.5 border border-red-100 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition"
                    required
                  />
                </div>

                {/* Reserve Price */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {t("reservePrice")} (€)
                  </label>
                  <input
                    type="number"
                    name="reserve_price"
                    value={form.reserve_price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2.5 border border-red-100 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition"
                  />
                </div>

                {/* Buy Now Price */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {t("buyNow")} (€)
                  </label>
                  <input
                    type="number"
                    name="buy_now_price"
                    value={form.buy_now_price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2.5 border border-red-100 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition"
                  />
                </div>

                {/* Minimum Increment */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    {t("minimumIncrementLabel")} (€) *
                  </label>
                  <input
                    type="number"
                    name="minimum_increment"
                    value={form.minimum_increment}
                    onChange={handleInputChange}
                    placeholder="1.00"
                    step="0.01"
                    min="0.01"
                    className="w-full px-4 py-2.5 border border-red-100 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none transition"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Duration Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                {t("duration")}
              </h3>

              {/* Quick Duration Presets */}
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-700 mb-4 uppercase tracking-widest flex items-center gap-2">
                  <span className="text-lg">🏁</span> Select When Auction Ends
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "2 min", minutes: 2 },
                    { label: "1 hour", minutes: 60 },
                    { label: "1 day", minutes: 24 * 60 },
                    { label: "7 days", minutes: 7 * 24 * 60 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        const now = new Date();
                        const endDate = new Date(
                          now.getTime() + preset.minutes * 60 * 1000,
                        );
                        const startTimeLocal = new Date(
                          now.getTime() - now.getTimezoneOffset() * 60000,
                        )
                          .toISOString()
                          .slice(0, 16);
                        const endTimeLocal = new Date(
                          endDate.getTime() -
                            endDate.getTimezoneOffset() * 60000,
                        )
                          .toISOString()
                          .slice(0, 16);
                        setForm((prev) => ({
                          ...prev,
                          start_time: startTimeLocal,
                          end_time: endTimeLocal,
                        }));
                        setSelectedDuration(preset.minutes);
                      }}
                      className={`px-4 py-3 border-2 rounded-xl font-bold text-base shadow-md hover:shadow-lg transform hover:scale-105 transition ${
                        selectedDuration === preset.minutes
                          ? "bg-gradient-to-br from-green-400 to-green-500 border-green-600 text-white"
                          : "bg-gradient-to-br from-red-50 to-red-100 border-red-300 text-red-700 hover:from-red-100 hover:to-red-200 hover:border-red-500"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                {form.end_time && (
                  <p className="text-sm text-slate-700 mt-4 font-semibold">
                    ⏰ Ends:{" "}
                    {new Date(form.end_time).toLocaleString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>

              {/* Anti-snipe Seconds */}
              <div className="mt-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {t("antiSnipe")}
                </label>
                <input
                  type="number"
                  name="anti_snipe_seconds"
                  value={form.anti_snipe_seconds}
                  onChange={handleInputChange}
                  placeholder="30"
                  min="0"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none transition"
                />
                <p className="text-xs text-slate-500 mt-1">{t("antiSnipe")}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-6 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 btn rounded-xl bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t("creating") : t("createAuctionButton")}
              </button>
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex-1 btn rounded-xl border border-red-200 text-red-700 hover:bg-red-50"
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateAuctionPage;

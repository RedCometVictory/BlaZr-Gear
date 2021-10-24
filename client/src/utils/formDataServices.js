export const createProductForm = (formData) => {
  let data = new FormData();

  formData.name && data.append("name", formData.name);
  formData.brand && data.append("brand", formData.brand);
  formData.category && data.append("category", formData.category);
  formData.description && data.append("description", formData.description);
  formData.price && data.append("price", formData.price);
  formData.count_in_stock && data.append("count_in_stock", formData.count_in_stock);
  formData.image_url && data.append("image_url", formData.image_url);

  return data;
};

export const updateProductForm = (formData) => {
  let data = new FormData();

  formData.name && data.append("name", formData.name);
  formData.brand && data.append("brand", formData.brand);
  formData.category && data.append("category", formData.category);
  formData.description && data.append("description", formData.description);
  formData.price && data.append("price", formData.price);
  formData.count_in_stock && data.append("count_in_stock", formData.count_in_stock);
  formData.image_url && data.append("image_url", formData.image_url);

  return data;
};

export const createUpdateSlideShowForm = (formData) => {
  let data = new FormData();

  formData.title && data.append("title", formData.title);
  formData.description && data.append("description", formData.description);
  formData.theme && data.append("theme", formData.theme);
  formData.category && data.append("category", formData.category);
  formData.image_url && data.append("image_url", formData.image_url);

  return data;
};
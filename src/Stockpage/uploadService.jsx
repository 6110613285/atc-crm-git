export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await fetch('/uploads', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Upload failed:', err);
    throw err;
  }
};
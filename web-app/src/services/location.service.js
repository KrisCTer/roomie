export async function fetchVietnamProvinces() {
  const res = await fetch("https://provinces.open-api.vn/api/?depth=3");
  if (!res.ok) {
    throw new Error("Failed to fetch provinces");
  }
  return await res.json();
}

import axios from "axios";

async function sendData(image: any, data: any) {
  const formData = new FormData();
  formData.append("image", image);

  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value as string | Blob);
  });

  try {
    const response = await axios.post(
      "https://cash.monggihub.com/api/v1/customer/auth/register",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log("dito", response.data);
    return "success";
  } catch (error) {
    console.error(error);
    return "error";
  }
}

export default sendData;

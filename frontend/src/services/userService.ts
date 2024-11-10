const API_URL = process.env.REACT_APP_BACKEND_API_URL;

export const saveUserInfo = async ({ email, ime, prezime, dateBirth }: any) => {
  try {
    const response = await fetch(`${API_URL}/user/update-user-info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, ime, prezime, dateBirth }),
    });

    if (!response.ok) {
      throw new Error("Failed to update user info");
    }

    const data = await response.json();

    if (data.success) {
      const userInfo = JSON.parse(localStorage.getItem("user") || "{}");

      if (ime) userInfo.ime = ime;
      if (prezime) userInfo.prezime = prezime;
      if (dateBirth) userInfo.dateBirth = dateBirth;

      localStorage.setItem("user", JSON.stringify(userInfo));

      return data;
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error("Error updating user info:", error);
    return false;
  }
};

export const uploadProfileImage = async ({ email, profileImage }: any) => {
  const formData = new FormData();
  formData.append("profileImage", profileImage);
  formData.append("email", email);

  try {
    const response = await fetch(`${API_URL}/user/upload-profile-image`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      // Ažuriraj localStorage sa novim URL-om profilne slike
      const userInfo = JSON.parse(localStorage.getItem("user") || "{}");
      userInfo.urlSlike = `${API_URL}${data.profileImageUrl}`;
      localStorage.setItem("user", JSON.stringify(userInfo));

      return data.profileImageUrl;
    } else {
      throw new Error("Failed to upload profile image.");
    }
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return null;
  }
};

export const activeProfile = async ({ userId, isActive }: any) => {
  try {
    console.log("active", isActive);
    const response = await fetch(`${API_URL}/user/updateIsActive`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, isActive: isActive ? 0 : 1 }),
    });

    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
};

const API_URL = "http://localhost:5000";

export const registerUser = async (userData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: string;
}) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Greška prilikom registracije");
    }
    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(
        error.message || "Došlo je do greške prilikom registracije."
      );
    } else {
      throw new Error("Došlo je do nepoznate greške.");
    }
  }
};

export const checkEmailVerification = async (
  email: string
): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/auth/check-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error("Došlo je do greške prilikom provere verifikacije.");
    }

    const data = await response.json();
    return data.isVerified;
  } catch (error) {
    console.error(error);
    throw new Error(
      error instanceof Error ? error.message : "Neuspešna provera verifikacije."
    );
  }
};

export const loginUser = async ({
  email,
  password,
  verificationCode,
}: {
  email: string;
  password: string;
  verificationCode?: string;
}): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, verificationCode }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Greška prilikom prijave."
    );
  }
};

interface LoginCredentials {
  email: string;
  password: string;
}

export const checkPassword = async ({ email, password }: LoginCredentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/check-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Login error:", error);
    return false;
  }
};

export const updatePassword = async ({ email, newPassword }: any) => {
  try {
    const response = await fetch("http://localhost:5000/auth/update-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, newPassword }),
    });
    if (!response.ok) {
      throw new Error("Update password failed");
    }
    const data = await response.json();
    return data.success;
  } catch (error) {
    return false;
  }
};

export const saveUserInfo = async ({
  email,
  name,
  surname,
  birthdate,
}: any) => {
  try {
    const response = await fetch(
      "http://localhost:5000/user/update-user-info",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, name, surname, birthdate }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update user info");
    }

    const data = await response.json();

    if (data.success) {
      // Ažuriraj localStorage samo ako je ažuriranje bilo uspešno
      const userInfo = JSON.parse(localStorage.getItem("user") || "{}");

      // Ažuriraj samo ona polja koja su prosleđena
      if (name) userInfo.ime = name;
      if (surname) userInfo.prezime = surname;
      if (birthdate) userInfo.dateBirth = birthdate;

      // Snimi nazad u localStorage
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
    const response = await fetch(
      "http://localhost:5000/user/upload-profile-image",
      {
        method: "POST",
        body: formData,
      }
    );

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

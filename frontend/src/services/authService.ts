const API_URL = process.env.REACT_APP_BACKEND_API_URL;

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
    console.log("ovo je data", data);
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
    const response = await fetch(`${API_URL}/auth/update-password`, {
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

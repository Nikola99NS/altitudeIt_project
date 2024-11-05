const API_URL = "http://localhost:5000";

export const registerUser = async (userData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: string;
}) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
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
    const response = await fetch(`${API_URL}/check-verification`, {
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
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, verificationCode }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Neuspešna prijava.");
    }

    return responseData;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Greška prilikom prijave."
    );
  }
};

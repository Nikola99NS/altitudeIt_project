export const saveUserData = (user: any, token: string) => {
  sessionStorage.setItem("token", token);
  localStorage.setItem(
    "user",
    JSON.stringify({
      id: user.id,
      ime: user.ime,
      prezime: user.prezime,
      email: user.email,
      dateBirth: new Date(user.datum_rodjenja).toISOString().slice(0, 10),
      urlSlike: process.env.REACT_APP_BACKEND_API_URL + user.urlSlike,
      roleId: user.role_id,
      isActive: user.isActive,
      twoFA: user.twoFA || 0,
    })
  );
};

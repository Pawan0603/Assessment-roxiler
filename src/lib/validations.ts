export const validateName = (v: string) => {
  if (!v) return "Name is required";
  if (v.length < 5) return "Name must be at least 5 characters";
  if (v.length > 60) return "Name must be at most 60 characters";
  return null;
};

export const validateAddress = (v: string) => {
  if (!v) return "Address is required";
  if (v.length > 400) return "Address must be at most 400 characters";
  return null;
};

export const validatePassword = (v: string) => {
  if (!v) return "Password is required";
  if (v.length <= 8 || v.length > 16)
    return "Password must be 8-16 characters";
  if (!/[A-Z]/.test(v))
    return "Password must include an uppercase letter";
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=/\\[\]`~';]/.test(v))
    return "Password must include a special character";
  return null;
};

export const validateEmail = (v: string) => {
  if (!v) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
    return "Invalid email format";
  return null;
};
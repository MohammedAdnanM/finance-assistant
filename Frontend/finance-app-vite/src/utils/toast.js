// utils/toast.js
import toast from "react-hot-toast";

const DEFAULT_OPTIONS = { duration: 2000 };

export const success = (msg, options = {}) => toast.success(msg, { ...DEFAULT_OPTIONS, ...options });
export const error = (msg, options = {}) => toast.error(msg, { ...DEFAULT_OPTIONS, ...options });

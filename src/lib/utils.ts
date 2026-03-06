import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getInitials = (fullName: string) => {
  const words = fullName.trim().split(" ");

  const initials = words.map((word) => word.charAt(0).toUpperCase());

  return initials.join("");
};

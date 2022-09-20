/**
 * Password validator for login pages
 */

import value from "../styles/_themes-vars";

// has number
const hasNumber = (password: string) => new RegExp(/[0-9]/).test(password);

// has mix of small and capitals
const hasMixed = (password: string) =>
  new RegExp(/[a-z]/).test(password) && new RegExp(/[A-Z]/).test(password);

// has special chars
const hasSpecial = (password: string) =>
  new RegExp(/[!#@$%^&*)(+=._-]/).test(password);

// set color based on password strength
export const strengthColor = (count: number) => {
  if (count === 1) return { label: "Poor", color: value.errorMain };
  if (count === 2) return { label: "Weak", color: value.warningDark };
  if (count === 3) return { label: "Normal", color: value.orangeMain };
  if (count === 4) return { label: "Good", color: value.successMain };
  if (count === 5) return { label: "Strong", color: value.successDark };
  return undefined;
};

// password strength indicator
export const strengthIndicator = (password: string) => {
  let strengths = 0;
  if (password.length >= 3) strengths += 1;
  if (password.length >= 8) strengths += 1;
  if (hasNumber(password)) strengths += 1;
  if (hasMixed(password)) strengths += 1;
  if (hasSpecial(password)) strengths += 1;
  return strengths;
};

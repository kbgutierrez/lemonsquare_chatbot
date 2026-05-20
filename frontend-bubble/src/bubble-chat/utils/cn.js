import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/* ========================================
   CLASSNAME MERGER
======================================== */

export const cn = (...inputs) =>
  twMerge(clsx(inputs))

export default cn
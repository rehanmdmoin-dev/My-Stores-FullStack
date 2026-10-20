

## Design

A custom "Boutique Ledger" visual identity — ink navy, warm ivory, and a brass
accent, paired with an editorial serif (Fraunces) for headings, Inter for body
text, and IBM Plex Mono for prices/stock/data — instead of the generic
purple-on-white admin template look. The layout (sidebar navigation, stat
cards, product grid, forms) follows the structure you liked from your
reference image, restyled.

## Setup

1. `npm install`
2. `cp .env.local.example .env.local` and point `NEXT_PUBLIC_API_URL` at your
   running backend (defaults to `http://localhost:5000/api`)
3. `npm run dev`

Make sure the backend is running first and CORS on the backend allows this
frontend's origin.

## Pages

| Route | Description |
|---|---|
| `/auth/register` | Create account (name, email, phone, password) |
| `/auth/otp` | 4-digit email verification (matches backend's OTP length) |
| `/auth/login` | Sign in |
| `/auth/forgot-password` | Request a reset link |
| `/auth/reset-password/[id]/[token]` | Set new password from the emailed link |
| `/dashboard` | Stats + recent products |
| `/dashboard/products` | All Products — public catalog, search/color/size/price/sort filters |
| `/dashboard/products/my` | My Products — table scoped to products you created |
| `/dashboard/products/add` | Add Product (with image upload) |
| `/dashboard/products/[id]` | Product details |
| `/dashboard/products/[id]/edit` | Edit product |
| `/dashboard/profile` | View/update name, email, phone |
| `/dashboard/change-password` | Sends a reset link to your own email (see note below) |

## Important notes / scope decisions

**"Change Password" reuses the reset-link flow.** Your backend has no
authenticated "change password with current password" endpoint — only
`resetPasswordLink` (email) → `resetPassword/:id/:token`. Rather than invent
an endpoint that doesn't exist on your backend, the Change Password page
sends a reset link to the logged-in user's own email and lets them complete
the change from their inbox, exactly like the forgot-password flow.

**Backend fixes made to support this frontend properly** (in addition to the
bugs fixed earlier):
- `productRoute.js` imported the `Auth` middleware but never applied it — all
  product endpoints were unprotected. Now `create/update/delete` require
  login; `GET` stays public for browsing.
- `Product` schema was missing the `image` field entirely, even though the
  controller set it — Mongoose was silently dropping the image URL on save.
- `uploads.js` wrote to a local `uploads/` folder that was never created,
  which would crash Multer on the first upload.
- Added `createdBy` to the `Product` schema so "My Products" can actually be
  distinguished from the public "All Products" catalog — the original schema
  had no concept of ownership at all.
- Added ownership checks to `updateProduct`/`deleteProduct` — previously any
  logged-in user could edit or delete *any* product, not just their own.

**"All Products" filters run client-side.** Your backend's `GET /user/get/product`
returns the full catalog with no query-param support, so search/color/size/
price/sort are all applied in the browser after fetching. Fine at small
scale; if the catalog grows large, this would be worth moving server-side.

## Stack

Next.js 16 (App Router) · Redux Toolkit · React Hook Form + Yup · Axios ·
react-cookie (JWT storage) · Tailwind CSS v4 · lucide-react · sonner (toasts)
